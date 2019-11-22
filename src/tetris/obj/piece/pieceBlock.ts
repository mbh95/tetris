import {Block} from "../block";
import {Position} from "../position";

export class PieceBlock {
    readonly block: Block;
    readonly relativePos: Position;

    constructor(block: Block, relativePos: Position) {
        this.block = block;
        this.relativePos = relativePos;
    }
}