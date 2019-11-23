import {TetrisActionEvent} from "../../../events/actionEvent";
import {TetrisSim} from "../../obj/sim/tetrisSim";
import {TetrisGame} from "../tetrisGame";
import {TetrisProps} from "../tetrisProps";

export class DelayState implements TetrisGame {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    readonly beforeState: TetrisGame;
    readonly afterState: TetrisGame;

    readonly totalDelay: number;
    readonly delayCountdown: number;

    constructor(beforeState: TetrisGame, afterState: TetrisGame, totalDelay: number, curDelay: number) {
        this.sim = beforeState.sim;
        this.props = beforeState.props;

        this.beforeState = beforeState;
        this.afterState = afterState;
        this.totalDelay = totalDelay;
        this.delayCountdown = curDelay;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleActionEvent(e: TetrisActionEvent): TetrisGame {
        return this;
    }

    tick(dt: number): TetrisGame {
        const newDelayCountdown = this.delayCountdown - dt;
        if (newDelayCountdown <= 0) {
            return this.afterState
        }
        return new DelayState(this.beforeState, this.afterState, this.totalDelay, newDelayCountdown);
    }

}