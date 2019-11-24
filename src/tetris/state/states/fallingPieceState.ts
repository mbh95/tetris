import {List, Record} from "immutable";
import {TetrisActionEvent, TetrisActionEventType} from "../../../events/actionEvent";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "../../util/tetrisUtils";
import {SimLockPieceResult} from "../sim/simLockPieceResult";
import {TetrisSim} from "../sim/tetrisSim";
import {TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
import {TetrisProps} from "../tetrisProps";
import {TransitionData, TransitionType} from "../transition";
import {DelayState} from "./delayState";
import {GameOverState} from "./gameOverState";

interface FallingPieceStateParams {
    sim?: TetrisSim;
    props?: TetrisProps;
    transitionData?: List<TransitionData>;

    gravityAccumulator?: number;
    lockCountdown?: number;
    canHold?: boolean;
}

export class FallingPieceState extends Record({
    sim: new TetrisSim(),
    props: new TetrisProps(0, 3, 1),
    transitionData: List<TransitionData>(),
    gravityAccumulator: 0,
    lockCountdown: 3,
    canHold: true,
}) implements TetrisGameState {

    readonly sim!: TetrisSim;
    readonly props!: TetrisProps;

    readonly gravityAccumulator!: number;
    readonly lockCountdown!: number;
    readonly canHold!: boolean;
    readonly transitionData!: List<TransitionData>;
    readonly type: TetrisGameStateType;

    constructor(params?: FallingPieceStateParams) {
        params ? super(params) : super();
        this.type = TetrisGameStateType.FALLING_PIECE;
    }

    private maybeGameOver(): TetrisGameState {
        if (!this.sim.matrix.isPieceValid(this.sim.fallingPiece)) {
            return new GameOverState(this.sim, this.props, this.transitionData);
        }
        return this;
    }

    private maybeTransition(nextState: TetrisGameState, maybeTransitionData: TransitionData): TetrisGameState {
        if (nextState === this) {
            return this;
        }
        return nextState.pushTransitionData(maybeTransitionData);
    }

    handleActionEvent(e: TetrisActionEvent): TetrisGameState {
        switch (e.type) {
            case TetrisActionEventType.MOVE_L:
                return this.maybeTransition(this.merge({sim: this.sim.movePiece(DIR_LEFT)}),
                    new TransitionData({type: TransitionType.ACTION_MOVE_L}));
            case TetrisActionEventType.MOVE_R:
                return this.maybeTransition(this.merge({sim: this.sim.movePiece(DIR_RIGHT)}),
                    new TransitionData({type: TransitionType.ACTION_MOVE_R}));
            case TetrisActionEventType.SOFT_DROP:
                return this.maybeTransition(this.merge({sim: this.sim.movePiece(DIR_DOWN)}),
                    new TransitionData({type: TransitionType.ACTION_SOFT_DROP}));
            case TetrisActionEventType.HARD_DROP:
                return this.merge({sim: this.sim.hardDrop()}).lockPiece(TransitionType.ACTION_HARD_DROP);
            case TetrisActionEventType.HOLD:
                return this.maybeTransition(this.hold(),
                    new TransitionData({type: TransitionType.ACTION_HOLD}));
            case TetrisActionEventType.ROTATE_CW:
                return this.maybeTransition(this.merge({sim: this.sim.rotateCw()}),
                    new TransitionData({type: TransitionType.ACTION_ROTATE_CW}));
            case TetrisActionEventType.ROTATE_CCW:
                return this.maybeTransition(this.merge({sim: this.sim.rotateCcw()}),
                    new TransitionData({type: TransitionType.ACTION_ROTATE_CCW}));
        }
        return this;
    }

    private hold(): TetrisGameState {
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

    private lockPiece(cause: TransitionType): TetrisGameState {
        const simLockResult: SimLockPieceResult = this.sim.lockPieceAndSpawnNext();
        const postLockState: TetrisGameState = new FallingPieceState({
            sim: simLockResult.newSim,
            props: this.props,
            transitionData: this.transitionData.push(new TransitionData({
                type: cause,
                simLockPieceResult: simLockResult
            }))
        }).maybeGameOver();

        if (!simLockResult.matrixLockPieceResult.clearedRows.isEmpty() && this.props.pieceClearDelay > 0) {
            // Bump transition data from post delay state to the delay state itself.
            return new DelayState(this, postLockState.clearTransitionData(), this.props.pieceClearDelay, this.props.pieceClearDelay, postLockState.transitionData);
        }
        return postLockState;
    }

    tick(dt: number): TetrisGameState {
        if (isPieceOnGround(this.sim.fallingPiece, this.sim.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                return this.lockPiece(TransitionType.TICK);
            }
            return this.merge({lockCountdown: newLockCountdown});
        } else {
            let newGravityAccumulator = this.gravityAccumulator + dt * this.props.gravityRate;
            let newPiece = this.sim.fallingPiece;
            let gravityTicks = 0;
            while (newGravityAccumulator >= 1.0 && !isPieceOnGround(newPiece, this.sim.matrix)) {
                newPiece = newPiece.maybeTranslated(DIR_DOWN, piece => this.sim.matrix.isPieceValid(piece));
                newGravityAccumulator -= 1.0;
                gravityTicks += 1;
            }
            if (gravityTicks > 0) {
                return this.merge({
                    sim: this.sim.merge({fallingPiece: newPiece}),
                    gravityAccumulator: newGravityAccumulator
                }).pushTransitionData(new TransitionData({type: TransitionType.GRAVITY}));
            } else {
                return this.merge({
                    gravityAccumulator: newGravityAccumulator
                });
            }
        }
    }

    clearTransitionData(): TetrisGameState {
        return this.merge({transitionData: List()});
    }

    pushTransitionData(transitionData: TransitionData): TetrisGameState {
        return this.merge({transitionData: this.transitionData.push(transitionData)});
    }
}