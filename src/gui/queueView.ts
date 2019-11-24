import {PiecePrototype} from "../tetris/state/piece/piecePrototype";
import {Generator} from "../util/generator";
import {BlockRenderer} from "./blockRenderer";
import {PiecePrototypeView} from "./piecePrototypeView";

export class QueueView {

    readonly previewLen: number;

    private readonly previews: PiecePrototypeView[];

    private lastRenderedQueue: Generator<PiecePrototype> | undefined;

    constructor(previewLen: number, visibleRows: number, visibleCols: number, blockSize: number, blockRenderer: BlockRenderer) {
        this.previewLen = previewLen;

        this.previews = new Array<PiecePrototypeView>(previewLen);
        for (let i = 0; i < this.previewLen; i++) {
            let size = blockSize;
            if (i > 0) {
                size = blockSize/2;
            }
            this.previews[i] = new PiecePrototypeView(visibleRows, visibleCols, size, blockRenderer)
        }
    }

    getPieceViews(): PiecePrototypeView[] {
        return this.previews.slice();
    }

    update(queue: Generator<PiecePrototype>): void {
        if (queue === this.lastRenderedQueue) {
            return;
        }
        let curGenerator: Generator<PiecePrototype> = queue;
        for (let i = 0; i < this.previewLen; i++) {
            const curPieceProto: PiecePrototype = curGenerator.get();
            this.previews[i].update(curPieceProto);
            curGenerator = curGenerator.next();
            this.lastRenderedQueue = queue;
        }
    }
}