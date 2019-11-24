import {List} from "immutable";
import {TetrisActionEvent} from "../events/actionEvent";
import {SimpleBlockRenderer} from "../gui/blockRenderer";
import {MatrixComponent} from "../gui/matrixComponent";
import {PiecePreviewComponent} from "../gui/piecePreviewComponent";
import {Matrix} from "../tetris/obj/matrix/matrix";
import {newTetrisGame, TetrisGame} from "../tetris/game/tetrisGame";
import {PiecePrototype} from "../tetris/obj/piece/piecePrototype";
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
    private readonly previewComponent: PiecePreviewComponent;
    constructor() {
        const pieceGenerator = BagGenerator.newBagGenerator<PiecePrototype>(List(ALL_SRS_TETROMINOES), new Random(BigInt(Date.now())));
        this.game = newTetrisGame(new Matrix({numRows: 40, numCols: 10}), pieceGenerator, 1.0, 3.0, 0.5);
        this.virtualGamepad = new VirtualGamepad(0.2, 60);
        this.keyboard = new KeyboardInputSource();
        this.keyboard.registerInputHandler(this.virtualGamepad.inputHandler);
        this.inputEventBuffer = [];
        this.virtualGamepad.registerActionHandler((e: TetrisActionEvent) => this.inputEventBuffer.push(e));

        this.matrixComponent = new MatrixComponent(20.5, 10, 20, new SimpleBlockRenderer());
        this.previewComponent = new PiecePreviewComponent(5, 4.5, 4.5, 10, new SimpleBlockRenderer());
    }

    init(): void {
        this.keyboard.init();
        this.matrixComponent.update(this.game.sim.matrix, this.game.sim.fallingPiece);
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
        const ctx = canvas.getContext("2d")!;

        // Draw matrix:
        this.matrixComponent.update(this.game.sim.matrix, this.game.sim.fallingPiece);
        const matrixCanvas: CanvasImageSource = this.matrixComponent.getImageSource();
        const matrixX = canvas.width / 2 - this.matrixComponent.getWidth() / 2;
        ctx.drawImage(matrixCanvas, matrixX, 0);
        ctx.strokeRect(matrixX, 0, this.matrixComponent.getWidth(), this.matrixComponent.getHeight());

        // Draw piece previews:
        this.previewComponent.update(this.game.sim.queue);
        const previews: CanvasImageSource[] = this.previewComponent.getImageSources();
        for (let i = 0; i < this.previewComponent.previewLen; i++) {
            const previewX = matrixX + this.matrixComponent.getWidth() + 5;
            const previewY = i * (this.previewComponent.getHeight() + 5);
            ctx.drawImage(previews[i], previewX, previewY);
            ctx.strokeRect(previewX, previewY, this.previewComponent.getWidth(), this.previewComponent.getHeight());
        }
    }
}