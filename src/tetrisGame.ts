import {BufferedEventHandler, EventHandler} from "./events";
import {TetrisInputEvent, TetrisInputEventSink} from "./input";

export interface TetrisGameState {

    handleInputEvent(e: TetrisInputEvent): void;

    update(dt: number): void;
}

class InputPrinterGameState implements TetrisGameState {
    private countdown = 1.0;
    handleInputEvent(e: TetrisInputEvent): void {
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

export class TetrisGame implements TetrisInputEventSink {
    readonly inputHandler: BufferedEventHandler<TetrisInputEvent> = new BufferedEventHandler();

    private state: TetrisGameState = new InputPrinterGameState();

    update(dt: number): void {
        this.handleInputEvents();
        this.state.update(dt);
    }

    handleInputEvents() {
        while (this.inputHandler.hasNext()) {
            const e: TetrisInputEvent | undefined = this.inputHandler.next();
            if (e !== undefined) {
                this.state.handleInputEvent(e);
            }
        }
    }

    getInputEventHandler(): EventHandler<TetrisInputEvent> {
        return this.inputHandler;
    }
}