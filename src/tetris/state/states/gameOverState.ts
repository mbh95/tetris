import {List} from "immutable";
import {TetrisActionEvent} from "../../../events/actionEvent";
import {TetrisSim} from "../sim/tetrisSim";
import {TetrisGameState, TetrisGameStateType} from "../tetrisGameState";
import {TetrisProps} from "../tetrisProps";
import {TransitionData} from "../transition";

export class GameOverState implements TetrisGameState {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;
    readonly transitionData: List<TransitionData>;
    readonly type: TetrisGameStateType = TetrisGameStateType.GAME_OVER;

    constructor(sim: TetrisSim, props: TetrisProps, transitionData: List<TransitionData>) {
        this.sim = sim;
        this.props = props;
        this.transitionData = transitionData;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleActionEvent(e: TetrisActionEvent): TetrisGameState {
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tick(dt: number): TetrisGameState {
        return this;
    }

    clearTransitionData(): TetrisGameState {
        return new GameOverState(this.sim, this.props, List());
    }
    pushTransitionData(transitionData: TransitionData): TetrisGameState {
        return new GameOverState(this.sim, this.props, this.transitionData.push(transitionData));
    }
}