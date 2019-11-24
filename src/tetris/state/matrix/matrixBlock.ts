import {Block} from "../block";
import {Piece} from "../piece/piece";
import {PieceBlock} from "../piece/pieceBlock";
import {Position} from "../position";

export class MatrixBlock {
    readonly block: Block;
    readonly matrixPos: Position;

    constructor(block: Block, matrixPos: Position) {
        this.block = block;
        this.matrixPos = matrixPos;
    }

    static fromPieceBlock(pieceBlock: PieceBlock, parentPiece: Piece): MatrixBlock {
        return new MatrixBlock(pieceBlock.block, pieceBlock.relativePos.translated(parentPiece.position));
    }
}