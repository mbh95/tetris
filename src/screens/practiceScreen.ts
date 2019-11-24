import {List} from "immutable";
import {TetrisActionEvent} from "../events/actionEvent";
import {SimpleBlockRenderer} from "../gui/blockRenderer";
import {MatrixComponent} from "../gui/matrixComponent";
import {Matrix} from "../tetris/obj/matrix/matrix";
import {newTetrisGame, TetrisGame} from "../tetris/game/tetrisGame";
import {Piece} from "../tetris/obj/piece/piece";
import {PiecePrototype} from "../tetris/obj/piece/piecePrototype";
import {Position} from "../tetris/obj/position";
import {ALL_SRS_TETROMINOES} from "../tetris/data/tetromino";
import {KeyboardInputSource} from "../input/keyboardInputSource";
import {VirtualGamepad} from "../input/virtualGamepad";
import {BagGenerator} from "../util/generator";
import {Random} from "../util/random";

export interface Screen {
    init(): void;

    exit(): void;

    tick(dt: number): void;

    render(canvas: HTMLCanvasElement): void;
}

export class PracticeScreen implements Screen {

    private game: TetrisGame;
    private virtualGamepad: VirtualGamepad;
    private keyboard: KeyboardInputSource;
    private inputEventBuffer: TetrisActionEvent[];
    private readonly matrixComponent: MatrixComponent;
    private readonly BLOCK_SIZE = 25;

    constructor() {
        const pieceGenerator = BagGenerator.newBagGenerator<PiecePrototype>(List(ALL_SRS_TETROMINOES), new Random(BigInt(Date.now())));
        this.game = newTetrisGame(new Matrix({numRows: 40, numCols: 10}), pieceGenerator, 1.0, 3.0, 0.5);
        this.virtualGamepad = new VirtualGamepad(0.2, 60);
        this.keyboard = new KeyboardInputSource();
        this.keyboard.registerInputHandler(this.virtualGamepad.inputHandler);
        this.inputEventBuffer = [];
        this.virtualGamepad.registerActionHandler((e: TetrisActionEvent) => this.inputEventBuffer.push(e));

        this.matrixComponent = new MatrixComponent(20.5, 10, 20, new SimpleBlockRenderer());

    }

    init(): void {
        this.keyboard.init();
    }

    exit(): void {
        this.keyboard.tearDown();
    }

    tick(dt: number): void {
        this.virtualGamepad.update(dt);
        const inputEventBufferSnapshot = this.inputEventBuffer.slice();
        for (const e of inputEventBufferSnapshot) {
            this.game = this.game.handleActionEvent(e);
        }
        this.game = this.game.tick(dt);
        this.inputEventBuffer = [];
    }

    render(canvas: HTMLCanvasElement): void {
        const matrixCanvas: CanvasImageSource = this.matrixComponent.update(this.game.sim.matrix, this.game.sim.fallingPiece);

        const ctx = canvas.getContext("2d")!;
        const canvasX = canvas.width / 2 - this.matrixComponent.getWidth() / 2;

        ctx.drawImage(matrixCanvas, canvasX, 0);
        ctx.strokeRect(canvasX, 0, this.matrixComponent.getWidth(), this.matrixComponent.getHeight());


    }
}