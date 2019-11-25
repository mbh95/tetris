import {List} from "immutable";
import {TetrisActionEvent} from "../../../events/actionEvent";
import {TetrisSim} from "../sim/tetrisSim";
import {AnyGameState, TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
import {TetrisProps} from "../tetrisProps";
import {StateTransition} from "../transition";

export class DelayState implements TetrisGameState<DelayState> {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    readonly beforeState: AnyGameState;
    readonly afterState: AnyGameState;

    readonly totalDelay: number;
    readonly delayCountdown: number;
    readonly transitionBuffer: List<StateTransition>;
    readonly type: TetrisGameStateType = TetrisGameStateType.DELAY;

    // Copy transition data from post delay state to the delay state itself.
    static newDelayStateWithEagerTransitionBuffer(beforeState: AnyGameState, afterState: AnyGameState, totalDelay: number): DelayState {
        return new DelayState(beforeState, afterState.clearTransitionBuffer(), totalDelay, totalDelay, afterState.transitionBuffer);
    }

    // Let the after state keep its transition buffer (will be cleared after this delay is over.
    static newDelayStateWithLazyTransitionBuffer(beforeState: AnyGameState, afterState: AnyGameState, totalDelay: number): DelayState {
        return new DelayState(beforeState, afterState, totalDelay, totalDelay, List());
    }

    private constructor(beforeState: AnyGameState, afterState: AnyGameState, totalDelay: number, curDelay: number, transitionData: List<StateTransition>) {
        this.sim = beforeState.sim;
        this.props = beforeState.props;

        this.beforeState = beforeState;
        this.afterState = afterState;
        this.totalDelay = totalDelay;
        this.delayCountdown = curDelay;
        this.transitionBuffer = transitionData;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleActionEvent(e: TetrisActionEvent): AnyGameState {
        return this;
    }

    tick(dt: number): AnyGameState {
        const newDelayCountdown = this.delayCountdown - dt;
        if (newDelayCountdown <= 0) {
            return this.afterState;
        }
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, newDelayCountdown, List());
    }


    clearTransitionBuffer(): DelayState {
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, this. delayCountdown, List());
    }

    pushTransition(transitionData: StateTransition): DelayState {
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, this. delayCountdown, this.transitionBuffer.push(transitionData));
    }
}