import {List, Record} from "immutable";
import {TetrisActionEvent, TetrisActionEventType} from "../../../events/actionEvent";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "../../util/tetrisUtils";
import {SimLockPieceResult} from "../sim/simLockPieceResult";
import {TetrisSim} from "../sim/tetrisSim";
import {AnyGameState, TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
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
}) implements TetrisGameState<FallingPieceState> {

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

    private maybeGameOver(): AnyGameState {
        if (!this.sim.matrix.isPieceValid(this.sim.fallingPiece)) {
            return new GameOverState(this.sim, this.props, this.transitionData);
        }
        return this;
    }

    private maybeTransitionSelf(nextState: FallingPieceState, maybeTransitionData: TransitionData): FallingPieceState {
        if (nextState === this) {
            return this;
        }
        return nextState.pushTransitionData(maybeTransitionData);
    }

    private maybeTransitionOther(nextState: AnyGameState, maybeTransitionData: TransitionData): AnyGameState {
        if (nextState === this) {
            return this;
        }
        return nextState.pushTransitionData(maybeTransitionData);
    }

    handleActionEvent(e: TetrisActionEvent): AnyGameState {
        switch (e.type) {
            case TetrisActionEventType.MOVE_L:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.movePiece(DIR_LEFT)}),
                    new TransitionData({type: TransitionType.MOVE_L}));
            case TetrisActionEventType.MOVE_R:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.movePiece(DIR_RIGHT)}),
                    new TransitionData({type: TransitionType.MOVE_R}));
            case TetrisActionEventType.SOFT_DROP:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.movePiece(DIR_DOWN)}),
                    new TransitionData({type: TransitionType.SOFT_DROP_FALL}));
            case TetrisActionEventType.HARD_DROP:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.hardDrop()}),
                    new TransitionData({type: TransitionType.HARD_DROP_FALL}))
                    .lockPiece(TransitionType.HARD_DROP_LOCK);
            case TetrisActionEventType.HOLD:
                return this.maybeTransitionOther(this.hold(),
                    new TransitionData({type: TransitionType.ACTION_HOLD}));
            case TetrisActionEventType.ROTATE_CW:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.rotateCw()}),
                    new TransitionData({type: TransitionType.ROTATE_CW}));
            case TetrisActionEventType.ROTATE_CCW:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.rotateCcw()}),
                    new TransitionData({type: TransitionType.ROTATE_CCW}));
        }
        return this;
    }

    private hold(): AnyGameState {
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

    private lockPiece(cause: TransitionType): AnyGameState {
        const simLockResult: SimLockPieceResult = this.sim.lockPieceAndSpawnNext();
        const postLockState: AnyGameState = new FallingPieceState({
            sim: simLockResult.newSim,
            props: this.props,
            transitionData: this.transitionData.push(new TransitionData({
                type: cause,
                lockData: {
                    prevMatrix: this.sim.matrix,
                    newMatrix: simLockResult.matrixLockPieceResult.newMatrix,
                    lockedPiece: this.sim.fallingPiece,
                    clearedRows: simLockResult.matrixLockPieceResult.clearedRows
                }
            }))
        }).maybeGameOver();

        if (!simLockResult.matrixLockPieceResult.clearedRows.isEmpty() && this.props.pieceClearDelay > 0) {
            // Bump transition data from post delay state to the delay state itself.
            return new DelayState(this, postLockState.clearTransitionData(), this.props.pieceClearDelay, this.props.pieceClearDelay, postLockState.transitionData);
        }
        return postLockState;
    }

    tick(dt: number): AnyGameState {
        if (isPieceOnGround(this.sim.fallingPiece, this.sim.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                return this.lockPiece(TransitionType.TIME_LOCK);
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
                }).pushTransitionData(new TransitionData({type: TransitionType.GRAVITY_FALL}));
            } else {
                return this.merge({
                    gravityAccumulator: newGravityAccumulator
                });
            }
        }
    }

    clearTransitionData(): FallingPieceState {
        return this.merge({transitionData: List()});
    }

    pushTransitionData(transitionData: TransitionData): FallingPieceState {
        return this.merge({transitionData: this.transitionData.push(transitionData)});
    }
}