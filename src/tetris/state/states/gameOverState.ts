import {List} from "immutable";
import {TetrisActionEvent} from "../../../events/actionEvent";
import {TetrisSim} from "../sim/tetrisSim";
import {AnyGameState, TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
import {TetrisProps} from "../tetrisProps";
import {StateTransition} from "../transition";

export class GameOverState implements TetrisGameState<GameOverState> {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;
    readonly transitionBuffer: List<StateTransition>;
    readonly type: TetrisGameStateType = TetrisGameStateType.GAME_OVER;

    constructor(sim: TetrisSim, props: TetrisProps, transitionData: List<StateTransition>) {
        this.sim = sim;
        this.props = props;
        this.transitionBuffer = transitionData;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleActionEvent(e: TetrisActionEvent): AnyGameState {
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tick(dt: number): AnyGameState {
        return this;
    }

    clearTransitionBuffer(): GameOverState {
        return new GameOverState(this.sim, this.props, List());
    }

    pushTransition(transitionData: StateTransition): GameOverState {
        return new GameOverState(this.sim, this.props, this.transitionBuffer.push(transitionData));
    }
}