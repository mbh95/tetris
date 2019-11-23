import {TetrisActionEvent} from "../../../events/actionEvent";
import {TetrisSim} from "../../obj/sim/tetrisSim";
import {TetrisGame} from "../tetrisGame";
import {TetrisProps} from "../tetrisProps";

export class GameOverState implements TetrisGame {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    constructor(sim: TetrisSim, props: TetrisProps) {
        this.sim = sim;
        this.props = props;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleActionEvent(e: TetrisActionEvent): TetrisGame {
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tick(dt: number): TetrisGame {
        return this;
    }

}