import {TetrisActionEvent} from "../../events/actionEvent";
import {TetrisStateTransitionEvent} from "../../events/transitionEvent";
import {Dispatcher} from "../../util/dispatcher";
import {AnyGameState, TetrisGameState} from "../state/tetrisGameState";
import {SpinDetector} from "./meta/spinDetector";

export class TetrisGame {
    private curGameState: AnyGameState;

    private readonly transitionDispatcher: Dispatcher<TetrisStateTransitionEvent>;

    constructor(initialGameState: AnyGameState) {
        this.curGameState = initialGameState;
        this.transitionDispatcher = new Dispatcher<TetrisStateTransitionEvent>();

        const spinDetector: SpinDetector = new SpinDetector();

        this.transitionDispatcher.registerCallback(spinDetector.transitionHandler);
    }

    getState(): AnyGameState {
        return this.curGameState;
    }

    tick(dt: number): void {
        const nextGameState: AnyGameState = this.curGameState.tick(dt);
        this.dispatchTransitionData(this.curGameState, nextGameState);
        this.curGameState = nextGameState.clearTransitionData();
    }

    handleActionEvent(e: TetrisActionEvent): void {
        const nextGameState: AnyGameState = this.curGameState.handleActionEvent(e);
        this.dispatchTransitionData(this.curGameState, nextGameState);
        this.curGameState = nextGameState.clearTransitionData();
    }

    dispatchTransitionData(prevState: AnyGameState, nextState: AnyGameState) {
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