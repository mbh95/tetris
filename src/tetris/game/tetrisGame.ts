import {TetrisActionEvent} from "../../events/actionEvent";
import {Dispatcher} from "../../util/dispatcher";
import {AnyGameState} from "../state/tetrisGameState";
import {StateTransition} from "../state/transition";
import {SpinDetector} from "./meta/spinDetector";

export class TetrisGame {
    private curGameState: AnyGameState;

    private readonly transitionDispatcher: Dispatcher<StateTransition>;

    constructor(initialGameState: AnyGameState) {
        this.curGameState = initialGameState;
        this.transitionDispatcher = new Dispatcher<StateTransition>();

        const spinDetector: SpinDetector = new SpinDetector();

        this.transitionDispatcher.registerCallback(spinDetector.transitionHandler);
    }

    getState(): AnyGameState {
        return this.curGameState;
    }

    tick(dt: number): void {
        const nextGameState: AnyGameState = this.curGameState.tick(dt);
        this.dispatchTransitionData(this.curGameState, nextGameState);
        this.curGameState = nextGameState.clearTransitionBuffer();
    }

    handleActionEvent(e: TetrisActionEvent): void {
        const nextGameState: AnyGameState = this.curGameState.handleActionEvent(e);
        this.dispatchTransitionData(this.curGameState, nextGameState);
        this.curGameState = nextGameState.clearTransitionBuffer();
    }

    dispatchTransitionData(prevState: AnyGameState, nextState: AnyGameState) {
        for (const transitionData of nextState.transitionBuffer) {
            this.transitionDispatcher.dispatch(transitionData);
        }
    }
}