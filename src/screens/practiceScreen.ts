import {List} from "immutable";
import {TetrisActionEvent} from "../events/actionEvent";
import {Matrix} from "../game/matrix";
import {BagPieceGenerator} from "../game/pieceGenerator";
import {newTetrisGame, TetrisGame} from "../game/tetrisGame";
import {ALL_SRS_TEROMINOES} from "../game/tetromino";
import {KeyboardInputSource} from "../input/keyboardInputSource";
import {VirtualGamepad} from "../input/virtualGamepad";

export interface Screen {
    init(): void;

    exit(): void;

    update(dt: number): void;

    render(canvas: HTMLCanvasElement): void;
}

export class PracticeScreen implements Screen {

    private game: TetrisGame;
    private virtualGamepad: VirtualGamepad;
    private keyboard: KeyboardInputSource;
    private inputEventBuffer: TetrisActionEvent[];

    constructor() {
        this.game = newTetrisGame(new Matrix(40, 10), BagPieceGenerator.newBagPieceGenerator(List(ALL_SRS_TEROMINOES)), 1.0, 3.0);
        this.virtualGamepad = new VirtualGamepad(1.0, 30);
        this.keyboard = new KeyboardInputSource();
        this.keyboard.registerInputHandler(this.virtualGamepad.inputHandler);
        this.inputEventBuffer = [];
        this.virtualGamepad.registerActionHandler((e: TetrisActionEvent) => this.inputEventBuffer.push(e));
    }

    init(): void {
        this.keyboard.init();
    }

    exit(): void {
        this.keyboard.tearDown();
    }

    update(dt: number): void {
        const inputEventBufferSnapshot = this.inputEventBuffer.slice();
        for (const e of inputEventBufferSnapshot) {
            this.game = this.game.handleActionEvent(e);
        }
        this.game = this.game.update(dt);
    }

    render(canvas: HTMLCanvasElement): void {
        
    }
}