import {List} from "immutable";
import {TetrisActionEvent} from "../../../events/actionEvent";
import {TetrisSim} from "../sim/tetrisSim";
import {TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
import {TetrisProps} from "../tetrisProps";
import {TransitionData} from "../transition";

export class DelayState implements TetrisGameState {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    readonly beforeState: TetrisGameState;
    readonly afterState: TetrisGameState;

    readonly totalDelay: number;
    readonly delayCountdown: number;
    readonly transitionData: List<TransitionData>;
    readonly type: TetrisGameStateType = TetrisGameStateType.DELAY;

    constructor(beforeState: TetrisGameState, afterState: TetrisGameState, totalDelay: number, curDelay: number, transitionData: List<TransitionData>) {
        this.sim = beforeState.sim;
        this.props = beforeState.props;

        this.beforeState = beforeState;
        this.afterState = afterState;
        this.totalDelay = totalDelay;
        this.delayCountdown = curDelay;
        this.transitionData = transitionData;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleActionEvent(e: TetrisActionEvent): TetrisGameState {
        return this;
    }

    tick(dt: number): TetrisGameState {
        const newDelayCountdown = this.delayCountdown - dt;
        if (newDelayCountdown <= 0) {
            return this.afterState
        }
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, newDelayCountdown, List());
    }


    clearTransitionData(): TetrisGameState {
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, this. delayCountdown, List());
    }

    pushTransitionData(transitionData: TransitionData): TetrisGameState {
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, this. delayCountdown, this.transitionData.push(transitionData));
    }
}