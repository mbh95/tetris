import {TetrisActionEvent} from "../events/actionEvent";
import {Queue} from "../util/queue";

export interface TetrisGameState {

    handleActionEvent(e: TetrisActionEvent): void;

    update(dt: number): void;
}

class ActionPrinterGameState implements TetrisGameState {
    private countdown = 1.0;

    handleActionEvent(e: TetrisActionEvent): void {
        console.log(e);
    }

    update(dt: number): void {
        this.countdown -= dt;
        if (this.countdown < 0) {
            console.log("tick");
            this.countdown = 1.0;
        }
    }
}

export class TetrisGame {

    private actionBuffer: Queue<TetrisActionEvent> = new Queue();
    readonly tetrisActionCallback: (e: TetrisActionEvent) => void = (e: TetrisActionEvent) => this.actionBuffer.push(e);

    private state: TetrisGameState = new ActionPrinterGameState();

    update(dt: number): void {
        this.handleActionEvents();
        this.state.update(dt);
    }

    handleActionEvents() {
        while (!this.actionBuffer.isEmpty()) {
            const e: TetrisActionEvent | undefined = this.actionBuffer.pop();
            if (e !== undefined) {
                this.state.handleActionEvent(e);
            }
        }
    }
}