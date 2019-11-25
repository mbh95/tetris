import {List, Record} from "immutable";
import {TetrisActionEvent, TetrisActionEventType} from "../../../events/actionEvent";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "../../util/tetrisUtils";
import {Piece} from "../piece/piece";
import {SimLockPieceResult} from "../sim/simLockPieceResult";
import {TetrisSim} from "../sim/tetrisSim";
import {AnyGameState, TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
import {TetrisProps} from "../tetrisProps";
import {StateTransition, TransitionData, TransitionType} from "../transition";
import {DelayState} from "./delayState";
import {GameOverState} from "./gameOverState";

interface FallingPieceStateParams {
    sim?: TetrisSim;
    props?: TetrisProps;
    transitionBuffer?: List<StateTransition>;

    gravityAccumulator?: number;
    lockCountdown?: number;
    canHold?: boolean;
}

export class FallingPieceState extends Record({
    sim: new TetrisSim(),
    props: new TetrisProps(0, 3, 1),
    transitionBuffer: List<StateTransition>(),
    gravityAccumulator: 0,
    lockCountdown: 3,
    canHold: true,
}) implements TetrisGameState<FallingPieceState> {

    readonly sim!: TetrisSim;
    readonly props!: TetrisProps;

    readonly gravityAccumulator!: number;
    readonly lockCountdown!: number;
    readonly canHold!: boolean;
    readonly transitionBuffer!: List<StateTransition>;
    readonly type: TetrisGameStateType;

    constructor(params?: FallingPieceStateParams) {
        params ? super(params) : super();
        this.type = TetrisGameStateType.FALLING_PIECE;
    }

    private maybeGameOver(): AnyGameState {
        if (!this.sim.matrix.isPieceValid(this.sim.fallingPiece)) {
            const gameOverState: GameOverState = new GameOverState(this.sim, this.props, this.transitionBuffer);
            return gameOverState.pushTransition(new StateTransition(this, gameOverState, {transitionType: TransitionType.GAME_OVER}));
        }
        return this;
    }

    private maybeTransitionSelf(nextState: FallingPieceState, maybeTransitionData: TransitionData): FallingPieceState {
        if (nextState === this) {
            return this;
        }
        return nextState.pushTransition(new StateTransition(this, nextState, maybeTransitionData));
    }

    private maybeTransitionOther(nextState: AnyGameState, maybeTransitionData: TransitionData): AnyGameState {
        if (nextState === this) {
            return this;
        }
        return nextState.pushTransition(new StateTransition(this, nextState, maybeTransitionData));
    }

    handleActionEvent(e: TetrisActionEvent): AnyGameState {
        switch (e.type) {
            case TetrisActionEventType.MOVE_L:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.movePiece(DIR_LEFT)}),
                    {transitionType: TransitionType.MOVE_L});
            case TetrisActionEventType.MOVE_R:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.movePiece(DIR_RIGHT)}),
                    {transitionType: TransitionType.MOVE_R});
            case TetrisActionEventType.SOFT_DROP:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.movePiece(DIR_DOWN)}),
                    {transitionType: TransitionType.SOFT_DROP_FALL});
            case TetrisActionEventType.HARD_DROP:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.hardDrop()}),
                    {transitionType: TransitionType.HARD_DROP_FALL})
                    .lockPiece(TransitionType.HARD_DROP_LOCK);
            case TetrisActionEventType.HOLD:
                return this.maybeTransitionOther(this.hold(),
                    {transitionType: TransitionType.ACTION_HOLD});
            case TetrisActionEventType.ROTATE_CW:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.rotateCw()}),
                    {transitionType: TransitionType.ROTATE_CW});
            case TetrisActionEventType.ROTATE_CCW:
                return this.maybeTransitionSelf(this.merge({sim: this.sim.rotateCcw()}),
                    {transitionType: TransitionType.ROTATE_CCW});
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

        let postLockState: FallingPieceState = new FallingPieceState({
            sim: simLockResult.newSim,
            props: this.props,
            transitionBuffer: this.transitionBuffer
        });

        postLockState = postLockState.pushTransition(new StateTransition(this, postLockState, {
            transitionType: cause,
            lockData: {
                prevMatrix: this.sim.matrix,
                newMatrix: simLockResult.matrixLockPieceResult.newMatrix,
                lockedPiece: this.sim.fallingPiece,
                clearedRows: simLockResult.matrixLockPieceResult.clearedRows
            }
        }));

        if (!simLockResult.matrixLockPieceResult.clearedRows.isEmpty() && this.props.pieceClearDelay > 0) {
            return DelayState.newDelayStateWithEagerTransitionBuffer(this, postLockState, this.props.pieceClearDelay);
        }
        return postLockState;
    }

    tick(dt: number): AnyGameState {
        console.log(this.gravityAccumulator);
        if (isPieceOnGround(this.sim.fallingPiece, this.sim.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                return this.merge({gravityAccumulator: 0}).lockPiece(TransitionType.TIME_LOCK);
            }
            return this.merge({gravityAccumulator: 0}).merge({lockCountdown: newLockCountdown});
        } else {
            const newGravityAccumulator = this.gravityAccumulator + dt * this.props.gravityRate;
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let nextState: FallingPieceState = this.merge({gravityAccumulator: newGravityAccumulator});
            while (nextState.gravityAccumulator >= 1.0) {
                const newPiece: Piece = nextState.sim.fallingPiece.maybeTranslated(DIR_DOWN, piece => nextState.sim.matrix.isPieceValid(piece));
                nextState = nextState.maybeTransitionSelf(nextState.merge({sim: nextState.sim.merge({fallingPiece: newPiece})}),
                    {transitionType: TransitionType.GRAVITY_FALL})
                    .merge({gravityAccumulator: nextState.gravityAccumulator - 1.0});
            }
            return nextState;
        }
    }

    clearTransitionBuffer(): FallingPieceState {
        return this.merge({transitionBuffer: List()});
    }

    pushTransition(transitionData: StateTransition): FallingPieceState {
        return this.merge({transitionBuffer: this.transitionBuffer.push(transitionData)});
    }
}