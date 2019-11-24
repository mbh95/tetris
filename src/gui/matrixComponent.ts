import {Matrix} from "../tetris/obj/matrix/matrix";
import {MatrixBlock} from "../tetris/obj/matrix/matrixBlock";
import {Piece} from "../tetris/obj/piece/piece";
import {getGhostPiece} from "../tetris/util/tetrisUtils";
import {BlockRenderer} from "./blockRenderer";

export class MatrixComponent {

    readonly visibleRows: number;
    readonly visibleCols: number;
    readonly blockSize: number;

    readonly blockRenderer: BlockRenderer;

    private readonly canvas: HTMLCanvasElement;
    private readonly ctx2d: CanvasRenderingContext2D;

    private lastDrawnMatrix: Matrix | undefined;
    private lastDrawnFallingPiece: Piece | undefined;


    constructor(visibleRows: number, visibleCols: number, blockSize: number, blockRenderer: BlockRenderer) {
        this.visibleRows = visibleRows;
        this.visibleCols = visibleCols;
        this.blockSize = blockSize;

        this.blockRenderer = blockRenderer;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.getWidth();
        this.canvas.height = this.getHeight();
        this.ctx2d = this.canvas.getContext("2d")!;
    }

    getWidth() {
        return this.visibleCols * this.blockSize;
    }

    getHeight(): number {
        return this.visibleRows * this.blockSize;
    }

    private drawBlock(matrixBlock: MatrixBlock) {
        const row = matrixBlock.matrixPos.row;
        const col = matrixBlock.matrixPos.col;
        const y: number = this.getHeight() - this.blockSize - (row * this.blockSize);
        const x: number = this.blockSize * col;
        this.blockRenderer.drawBlock(this.ctx2d, matrixBlock.block, x, y, this.blockSize);
    }

    update(matrix: Matrix, fallingPiece: Piece): HTMLCanvasElement {
        if (this.lastDrawnMatrix === matrix && this.lastDrawnFallingPiece === fallingPiece) {
            return this.canvas;
        }
        this.ctx2d.save();
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

        matrix.getBlocks().forEach(matrixBlock => this.drawBlock(matrixBlock));

        this.ctx2d.save();
        this.ctx2d.globalAlpha = 0.5;
        getGhostPiece(fallingPiece, matrix).getMatrixBlocks().forEach(matrixBlock => {
            this.drawBlock(matrixBlock);
        });
        this.ctx2d.restore();

        fallingPiece.getMatrixBlocks().forEach(matrixBlock => this.drawBlock(matrixBlock));

        this.ctx2d.restore();

        this.lastDrawnMatrix = matrix;
        this.lastDrawnFallingPiece = fallingPiece;
        return this.canvas;
    }
}