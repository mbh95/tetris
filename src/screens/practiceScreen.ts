import {List} from "immutable";
import {TetrisActionEvent} from "../events/actionEvent";
import {Matrix} from "../tetris/obj/matrix/matrix";
import {newTetrisGame, TetrisGame} from "../tetris/game/tetrisGame";
import {Piece} from "../tetris/obj/piece/piece";
import {PiecePrototype} from "../tetris/obj/piece/piecePrototype";
import {getGhostPiece} from "../tetris/util/tetrisUtils";
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
    private readonly matrixCanvas: HTMLCanvasElement;
    private readonly BLOCK_SIZE = 10;

    constructor() {
        const pieceGenerator = BagGenerator.newBagGenerator<PiecePrototype>(List(ALL_SRS_TETROMINOES), new Random(BigInt(Date.now())));
        this.game = newTetrisGame(new Matrix({numRows: 40, numCols: 10}), pieceGenerator, 1.0, 3.0, 0.5);
        this.virtualGamepad = new VirtualGamepad(0.2, 60);
        this.keyboard = new KeyboardInputSource();
        this.keyboard.registerInputHandler(this.virtualGamepad.inputHandler);
        this.inputEventBuffer = [];
        this.virtualGamepad.registerActionHandler((e: TetrisActionEvent) => this.inputEventBuffer.push(e));

        this.matrixCanvas = document.createElement("canvas");
        this.matrixCanvas.width = 10 * this.BLOCK_SIZE;
        this.matrixCanvas.height = 20.5 * this.BLOCK_SIZE;

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

    private renderBlock(matrixCtx: CanvasRenderingContext2D, row: number, col: number): void {
        const y = this.matrixCanvas.height - this.BLOCK_SIZE - (row * this.BLOCK_SIZE);
        const x = this.BLOCK_SIZE * col;
        matrixCtx.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }

    render(canvas: HTMLCanvasElement): void {
        const matrixCtx = this.matrixCanvas.getContext("2d")!;
        matrixCtx.clearRect(0, 0, this.matrixCanvas.width, this.matrixCanvas.height);

        const matrix: Matrix = this.game.sim.matrix;
        const fallingPiece: Piece = this.game.sim.fallingPiece;

        matrixCtx.fillStyle = "red";
        matrix.getBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.matrixPos.row, block.matrixPos.col);
        });

        matrixCtx.fillStyle = "yellow";
        getGhostPiece(fallingPiece, matrix).getMatrixBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.matrixPos.row, block.matrixPos.col);
        });

        matrixCtx.fillStyle = "green";
        fallingPiece.getMatrixBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.matrixPos.row, block.matrixPos.col);
        });

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(this.matrixCanvas, 0, 0);
    }
}