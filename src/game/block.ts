import {Piece} from "./piece";
import {Position} from "./position";

export class Block {
    readonly colorId: number;

    constructor(colorId: number) {
        this.colorId = colorId;
    }
}

export class PieceBlock {
    readonly block: Block;
    readonly relativePos: Position;

    constructor(block: Block, relativePos: Position) {
        this.block = block;
        this.relativePos = relativePos;
    }
}

export class MatrixBlock {
    readonly block: Block;
    readonly matrixPos: Position;

    constructor(block: Block, matrixPos: Position) {
        this.block = block;
        this.matrixPos = matrixPos;
    }

    static fromPieceBlock(pieceBlock: PieceBlock, parentPiece: Piece): MatrixBlock {
        return new MatrixBlock(
            pieceBlock.block,
            pieceBlock.relativePos.translated(parentPiece.position));
    }
}