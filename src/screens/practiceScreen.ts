import {List} from "immutable";
import {TetrisActionEvent} from "../events/actionEvent";
import {SimpleBlockRenderer} from "../gui/blockRenderer";
import {MatrixView} from "../gui/matrixView";
import {PiecePrototypeView} from "../gui/piecePrototypeView";
import {QueueView} from "../gui/queueView";
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
    private readonly matrixView: MatrixView;
    private readonly queueView: QueueView;
    private readonly holdView: PiecePrototypeView;

    constructor() {
        const pieceGenerator = BagGenerator.newBagGenerator<PiecePrototype>(List(ALL_SRS_TETROMINOES), new Random(BigInt(Date.now())));
        this.game = newTetrisGame(new Matrix({numRows: 40, numCols: 10}), pieceGenerator, 1.0, 3.0, 0.5);
        this.virtualGamepad = new VirtualGamepad(0.2, 60);
        this.keyboard = new KeyboardInputSource();
        this.keyboard.registerInputHandler(this.virtualGamepad.inputHandler);
        this.inputEventBuffer = [];
        this.virtualGamepad.registerActionHandler((e: TetrisActionEvent) => this.inputEventBuffer.push(e));

        this.matrixView = new MatrixView(20.5, 10, 20, new SimpleBlockRenderer());
        this.queueView = new QueueView(5, 4.5, 4.5, 10, new SimpleBlockRenderer());
        this.holdView = new PiecePrototypeView(4.5, 4.5, 10, new SimpleBlockRenderer());
    }

    init(): void {
        this.keyboard.init();
        this.matrixView.update(this.game.sim.matrix, this.game.sim.fallingPiece);
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
        this.matrixView.update(this.game.sim.matrix, this.game.sim.fallingPiece);
        const matrixCanvas: CanvasImageSource = this.matrixView.getImageSource();
        const matrixX = canvas.width / 2 - this.matrixView.getWidth() / 2;
        ctx.drawImage(matrixCanvas, matrixX, 0);
        ctx.strokeRect(matrixX, 0, this.matrixView.getWidth(), this.matrixView.getHeight());

        // Draw piece previews:
        this.queueView.update(this.game.sim.queue);
        const previews: PiecePrototypeView[] = this.queueView.getPieceViews();
        let previewY = 0;
        for (let i = 0; i < this.queueView.previewLen; i++) {
            const pieceView: PiecePrototypeView = previews[i];
            const previewX = matrixX + this.matrixView.getWidth() + 5;
            ctx.drawImage(pieceView.getImageSource(), previewX, previewY);
            ctx.strokeRect(previewX, previewY, pieceView.getWidth(), pieceView.getHeight());
            previewY += (pieceView.getHeight() + 5);
        }

        // Draw hold piece:
        this.holdView.update(this.game.sim.heldPiece);
        const holdCanvas = this.holdView.getImageSource();
        const holdX = matrixX - 5 - this.holdView.getWidth();
        ctx.drawImage(holdCanvas, holdX, 0);
        ctx.strokeRect(holdX, 0, this.holdView.getWidth(), this.holdView.getHeight());

    }
}