import {List} from "immutable";
import {TetrisActionEvent} from "../events/actionEvent";
import {BlockColor} from "../tetris/data/blockColor";
import {Block} from "../tetris/obj/block";
import {Matrix} from "../tetris/obj/matrix/matrix";
import {newTetrisGame, TetrisGame} from "../tetris/game/tetrisGame";
import {Piece} from "../tetris/obj/piece/piece";
import {PiecePrototype} from "../tetris/obj/piece/piecePrototype";
import {Position} from "../tetris/obj/position";
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

function getFillStyle(color: BlockColor): string {
    switch (color) {
        case BlockColor.UNKNOWN:
            return "fuchsia";
        case BlockColor.I_CYAN:
            return "cyan";
        case BlockColor.J_BLUE:
            return "blue";
        case BlockColor.L_ORANGE:
            return "orange";
        case BlockColor.O_YELLOW:
            // return "yellow";
            return "gold";
        case BlockColor.S_GREEN:
            return "green";
        case BlockColor.T_PURPLE:
            return "purple";
        case BlockColor.Z_RED:
            return "red";
    }
}

export class PracticeScreen implements Screen {

    private game: TetrisGame;
    private virtualGamepad: VirtualGamepad;
    private keyboard: KeyboardInputSource;
    private inputEventBuffer: TetrisActionEvent[];
    private readonly matrixCanvas: HTMLCanvasElement;
    private readonly BLOCK_SIZE = 25;

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

    private renderPiecePrototype(matrixCtx: CanvasRenderingContext2D, piecePrototype: PiecePrototype): void {
        const piece: Piece = new Piece({piecePrototype, position: new Position({row: 2, col: 2})});
        piece.getMatrixBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.block, block.matrixPos.row, block.matrixPos.col);
        });
    }

    private renderBlock(matrixCtx: CanvasRenderingContext2D, block: Block, row: number, col: number, alpha = 1.0): void {
        const y = this.matrixCanvas.height - this.BLOCK_SIZE - (row * this.BLOCK_SIZE);
        const x = this.BLOCK_SIZE * col;

        matrixCtx.save();
        matrixCtx.beginPath();
        matrixCtx.rect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
        matrixCtx.fillStyle = getFillStyle(block.color);
        matrixCtx.globalAlpha = alpha;
        matrixCtx.strokeStyle = "black";
        matrixCtx.fill();
        matrixCtx.stroke();
        matrixCtx.closePath();
        matrixCtx.restore();
    }

    render(canvas: HTMLCanvasElement): void {
        const matrixCtx = this.matrixCanvas.getContext("2d")!;
        matrixCtx.save();
        matrixCtx.clearRect(0, 0, this.matrixCanvas.width, this.matrixCanvas.height);

        const matrix: Matrix = this.game.sim.matrix;
        const fallingPiece: Piece = this.game.sim.fallingPiece;

        matrix.getBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.block, block.matrixPos.row, block.matrixPos.col);
        });

        getGhostPiece(fallingPiece, matrix).getMatrixBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.block, block.matrixPos.row, block.matrixPos.col, 0.5);
        });

        fallingPiece.getMatrixBlocks().forEach(block => {
            this.renderBlock(matrixCtx, block.block, block.matrixPos.row, block.matrixPos.col);
        });
        matrixCtx.restore();

        const ctx = canvas.getContext("2d")!;
        const canvasX = canvas.width / 2 - this.matrixCanvas.width / 2;

        ctx.drawImage(this.matrixCanvas, canvasX, 0);
        ctx.strokeRect(canvasX, 0, this.matrixCanvas.width, this.matrixCanvas.height);


    }
}