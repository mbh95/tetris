import {Piece} from "../tetris/obj/piece/piece";
import {PiecePrototype} from "../tetris/obj/piece/piecePrototype";
import {BlockRenderer} from "./blockRenderer";

export class PiecePrototypeView {
    readonly visibleRows: number;
    readonly visibleCols: number;
    readonly blockSize: number;
    readonly blockRenderer: BlockRenderer;

    private readonly canvas: HTMLCanvasElement;
    private readonly ctx2d: CanvasRenderingContext2D;

    private lastRenderedPiecePrototype: PiecePrototype | undefined;

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

    getWidth(): number {
        return this.visibleCols * this.blockSize;
    }

    getHeight(): number {
        return this.visibleRows * this.blockSize;
    }

    getImageSource(): CanvasImageSource {
        return this.canvas;
    }

    update(piecePrototype: PiecePrototype | undefined): void {
        if (piecePrototype === this.lastRenderedPiecePrototype) {
            return;
        }

        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (piecePrototype === undefined) {
            return;
        }

        const piece: Piece = new Piece({piecePrototype});
        const curBlocks = piece.getBlocks();
        const maxRow = curBlocks.map(pieceBlock => pieceBlock.relativePos.row).reduce<number>((a, b) => a > b ? a : b, -Infinity);
        const minRow = curBlocks.map(pieceBlock => pieceBlock.relativePos.row).reduce<number>((a, b) => a > b ? b : a, Infinity);
        const maxCol = curBlocks.map(pieceBlock => pieceBlock.relativePos.col).reduce<number>((a, b) => a > b ? a : b, -Infinity);
        const minCol = curBlocks.map(pieceBlock => pieceBlock.relativePos.col).reduce<number>((a, b) => a > b ? b : a, Infinity);

        const midRow = (minRow + maxRow) / 2.0;
        const midCol = (minCol + maxCol) / 2.0;

        curBlocks.forEach(pieceBlock => {
            const dc = pieceBlock.relativePos.col - midCol;
            const dr = -(pieceBlock.relativePos.row - midRow);
            const x = this.blockSize * dc + this.getWidth() / 2.0 - this.blockSize / 2.0;
            const y = this.blockSize * dr + this.getHeight() / 2.0 - this.blockSize / 2.0;
            this.blockRenderer.drawBlock(this.ctx2d, pieceBlock.block, x, y, this.blockSize);
        });

        this.lastRenderedPiecePrototype = piecePrototype;
    }
}