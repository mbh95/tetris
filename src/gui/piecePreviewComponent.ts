import {Piece} from "../tetris/obj/piece/piece";
import {PiecePrototype} from "../tetris/obj/piece/piecePrototype";
import {Generator} from "../util/generator";
import {BlockRenderer} from "./blockRenderer";

export class PiecePreviewComponent {

    readonly previewLen: number;
    readonly visibleRows: number;
    readonly visibleCols: number;
    readonly blockSize: number;

    readonly blockRenderer: BlockRenderer;

    private readonly previews: HTMLCanvasElement[];

    private lastRenderedQueue: Generator<PiecePrototype> | undefined;

    constructor(previewLen: number, visibleRows: number, visibleCols: number, blockSize: number, blockRenderer: BlockRenderer) {
        this.previewLen = previewLen;
        this.visibleRows = visibleRows;
        this.visibleCols = visibleCols;
        this.blockSize = blockSize;
        this.blockRenderer = blockRenderer;

        this.previews = new Array<HTMLCanvasElement>(previewLen);
        for (let i = 0; i < this.previewLen; i++) {
            this.previews[i] = document.createElement("canvas");
        }
    }

    getWidth(): number {
        return this.visibleCols * this.blockSize;
    }

    getHeight(): number {
        return this.visibleRows * this.blockSize;
    }

    getImageSources(): CanvasImageSource[] {
        return this.previews.slice();
    }

    update(queue: Generator<PiecePrototype>): void {
        if (queue === this.lastRenderedQueue) {
            return;
        }
        let curGenerator: Generator<PiecePrototype> = queue;
        for (let i = 0; i < this.previewLen; i++) {
            const curPieceProto: PiecePrototype = curGenerator.get();
            const curPiece: Piece = new Piece({piecePrototype: curPieceProto});
            const curBlocks = curPiece.getBlocks();
            const maxRow = curBlocks.map(pieceBlock => pieceBlock.relativePos.row).reduce<number>((a, b) => a > b ? a : b, -Infinity);
            const minRow = curBlocks.map(pieceBlock => pieceBlock.relativePos.row).reduce<number>((a, b) => a > b ? b : a, Infinity);
            const maxCol = curBlocks.map(pieceBlock => pieceBlock.relativePos.col).reduce<number>((a, b) => a > b ? a : b, -Infinity);
            const minCol = curBlocks.map(pieceBlock => pieceBlock.relativePos.col).reduce<number>((a, b) => a > b ? b : a, Infinity);

            const midRow = (minRow + maxRow) / 2.0;
            const midCol = (minCol + maxCol) / 2.0;

            const curCanvas: HTMLCanvasElement = this.previews[i];
            const ctx2d: CanvasRenderingContext2D = curCanvas.getContext("2d")!;

            ctx2d.clearRect(0, 0, curCanvas.width, curCanvas.height);
            curBlocks.forEach(pieceBlock => {
                const dc = pieceBlock.relativePos.col - midCol;
                const dr = -(pieceBlock.relativePos.row - midRow);
                const x = this.blockSize * dc + this.getWidth() / 2.0 - this.blockSize / 2.0;
                const y = this.blockSize * dr + this.getHeight() / 2.0 - this.blockSize / 2.0;
                this.blockRenderer.drawBlock(ctx2d, pieceBlock.block, x, y, this.blockSize);
            });

            curGenerator = curGenerator.next();
            this.lastRenderedQueue = queue;
        }
    }
}