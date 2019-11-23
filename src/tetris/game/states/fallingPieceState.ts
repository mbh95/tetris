import {Record} from "immutable";
import {TetrisActionEvent, TetrisActionEventType} from "../../../events/actionEvent";
import {SimLockPieceResult} from "../../obj/sim/simLockPieceResult";
import {TetrisGame} from "../tetrisGame";
import {TetrisProps} from "../tetrisProps";
import {TetrisSim} from "../../obj/sim/tetrisSim";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "../../util/tetrisUtils";
import {DelayState} from "./delayState";
import {GameOverState} from "./gameOverState";

interface FallingPieceStateParams {
    sim?: TetrisSim;
    props?: TetrisProps;

    gravityAccumulator?: number;
    lockCountdown?: number;
    canHold?: boolean;
}

export class FallingPieceState extends Record({
    sim: new TetrisSim(),
    props: new TetrisProps(0, 3, 1),
    gravityAccumulator: 0,
    lockCountdown: 3,
    canHold: true,
}) implements TetrisGame {

    readonly sim!: TetrisSim;
    readonly props!: TetrisProps;

    readonly gravityAccumulator!: number;
    readonly lockCountdown!: number;
    readonly canHold!: boolean;

    constructor(params?: FallingPieceStateParams) {
        params ? super(params) : super();
    }

    private maybeGameOver(): TetrisGame {
        if (!this.sim.matrix.isPieceValid(this.sim.fallingPiece)) {
            console.log("GAME OVER");
            return new GameOverState(this.sim, this.props);
        }
        return this;
    }

    handleActionEvent(e: TetrisActionEvent): TetrisGame {
        console.log("ACTION EVENT: " + e.type);
        switch (e.type) {
            case TetrisActionEventType.MOVE_L:
                return this.merge({sim: this.sim.movePiece(DIR_LEFT)});
            case TetrisActionEventType.MOVE_R:
                return this.merge({sim: this.sim.movePiece(DIR_RIGHT)});
            case TetrisActionEventType.SOFT_DROP:
                return this.merge({sim: this.sim.movePiece(DIR_DOWN)});
            case TetrisActionEventType.HARD_DROP:
                return this.merge({sim: this.sim.hardDrop()}).lockPiece();
            case TetrisActionEventType.HOLD:
                return this.hold();
            case TetrisActionEventType.ROTATE_CW:
                return this.merge({sim: this.sim.rotateCw()});
            case TetrisActionEventType.ROTATE_CCW:
                return this.merge({sim: this.sim.rotateCcw()});
        }
        return this;
    }

    private hold(): TetrisGame {
        if (this.canHold) {
            return this.merge({
                canHold: false,
                gravityAccumulator: 0,
                lockCountdown: this.props.lockDelay,
                sim: this.sim.swap()
            }).maybeGameOver();
        }
        return this;
    }

    private lockPiece(): TetrisGame {
        const simLockResult: SimLockPieceResult = this.sim.lockPieceAndSpawnNext();
        const postLockState: TetrisGame = new FallingPieceState({
            sim: simLockResult.newSim,
            props: this.props
        }).maybeGameOver();

        if (!simLockResult.matrixLockPieceResult.clearedRows.isEmpty() && this.props.pieceClearDelay > 0) {
            console.log("DELAY");
            return new DelayState(this, postLockState, this.props.pieceClearDelay, this.props.pieceClearDelay);
        }
        return postLockState;
    }

    tick(dt: number): TetrisGame {
        console.log("FPS - TICK");
        if (isPieceOnGround(this.sim.fallingPiece, this.sim.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                console.log("LOCKING PIECE");
                return this.lockPiece();
            }
            return this.merge({lockCountdown: newLockCountdown});
        } else {
            let newGravityAccumulator = this.gravityAccumulator + dt * this.props.gravityRate;
            let newPiece = this.sim.fallingPiece;
            while (newGravityAccumulator >= 1.0 && !isPieceOnGround(newPiece, this.sim.matrix)) {
                console.log("GRAVITY: " + newGravityAccumulator);

                newPiece = newPiece.maybeTranslated(DIR_DOWN, piece => this.sim.matrix.isPieceValid(piece));
                newGravityAccumulator -= 1.0;
            }
            return this.merge({sim: this.sim.merge({fallingPiece: newPiece}), gravityAccumulator: newGravityAccumulator});
        }
    }
}