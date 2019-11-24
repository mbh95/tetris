import {TetrisActionEvent} from "../../events/actionEvent";
import {TetrisStateTransitionEvent} from "../../events/transitionEvent";
import {Dispatcher} from "../../util/dispatcher";
import {TetrisGameState} from "../state/tetrisGameState";

export class TetrisGame {
    private curGameState: TetrisGameState;

    private readonly transitionDispatcher: Dispatcher<TetrisStateTransitionEvent>;

    constructor(initialGameState: TetrisGameState) {
        this.curGameState = initialGameState;
        this.transitionDispatcher = new Dispatcher<TetrisStateTransitionEvent>();
    }

    getState(): TetrisGameState {
        return this.curGameState;
    }

    tick(dt: number): void {
        const nextGameState: TetrisGameState = this.curGameState.tick(dt);
        this.dispatchTransitionData(this.curGameState, nextGameState);
        this.curGameState = nextGameState.clearTransitionData();
    }

    handleActionEvent(e: TetrisActionEvent): void {
        const nextGameState: TetrisGameState = this.curGameState.handleActionEvent(e);
        this.dispatchTransitionData(this.curGameState, nextGameState);
        this.curGameState = nextGameState.clearTransitionData();
    }

    dispatchTransitionData(prevState: TetrisGameState, nextState: TetrisGameState) {
        if (nextState.transitionData.size > 0) {
            for (const transitionData of nextState.transitionData) {
                const e: TetrisStateTransitionEvent = {
                    prevState,
                    nextState
                };
                this.transitionDispatcher.dispatch(e);
            }
        }
    }
}