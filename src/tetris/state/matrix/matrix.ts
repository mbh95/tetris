import {Block} from "../block/block";
import {Position} from "../position";
import {Piece} from "../piece/piece";
import {Map, Range, Record, Seq, Set} from "immutable";
import {MatrixLockPieceResult} from "./matrixLockPieceResult";
import {MatrixBlock} from "./matrixBlock";
import Indexed = Seq.Indexed;

interface MatrixParams {
    numRows?: number;
    numCols?: number;
    blocks?: Map<Position, Block>;
    spawnPos?: Position;
}

export class Matrix extends Record({
    numRows: 40,
    numCols: 10,
    blocks: Map(),
    spawnPos: new Position({row: 19, col: 4}),
}) {
    readonly numRows!: number;
    readonly numCols!: number;
    readonly blocks!: Map<Position, Block>;
    readonly spawnPos!: Position;

    constructor(params?: MatrixParams) {
        params? super(params) : super();
    }

    isPositionValidRC(r: number, c: number): boolean {
        return 0 <= r && r < this.numRows && 0 <= c && c < this.numCols;
    }

    isPositionValid(pos: Position): boolean {
        return this.isPositionValidRC(pos.row, pos.col);
    }

    isPositionEmpty(pos: Position): boolean {
        return this.isPositionValid(pos) && this.blocks.get(pos) === undefined;
    }

    getBlocks(): Indexed<MatrixBlock> {
        return this.blocks
            .entrySeq()
            .map(posBlockPair => new MatrixBlock(posBlockPair[1], posBlockPair[0]));
    }

    /**
     * Return true iff the given piece does not intersect blocks in this Matrix or go out of bounds.
     * @param piece - The piece to check.
     */
    isPieceValid(piece: Piece): boolean {
        for (const matrixBlock of piece.getMatrixBlocks()) {
            if (!this.isPositionEmpty(matrixBlock.matrixPos)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Lock the given piece into this Matrix removing any full rows that result.
     *
     * @param piece - The Piece to lock into this Matrix.
     * @returns A MatrixLockPieceResult where the newMatrix is a new Matrix resulting from locking on success and this Matrix on failure.
     */
    lockPiece(piece: Piece): MatrixLockPieceResult {
        // If the piece doesn't fit in the matrix then return a no-op lock result.
        if (!this.isPieceValid(piece)) {
            return new MatrixLockPieceResult(this, Set([]));
        }

        // Put the piece into the matrix.
        let blocksWithPiece = this.blocks;
        for (const matrixBlock of piece.getMatrixBlocks()) {
            blocksWithPiece = blocksWithPiece.set(matrixBlock.matrixPos, matrixBlock.block);
        }

        // Compute which rows were cleared by looking at the rows which the piece touched and checking if they are filled.
        const affectedRows: Set<number> = piece.getMatrixBlocks().map(matrixBlock => matrixBlock.matrixPos.row).toSet();
        const clearedRows: Set<number> = affectedRows
            .filter(row =>
                Range(0, this.numCols)
                    .map(col => new Position({row, col}))
                    .filter(pos => blocksWithPiece.get(pos) === undefined)
                    .isEmpty());

        // If no rows were cleared just return the new Matrix
        if (clearedRows.isEmpty()) {
            return new MatrixLockPieceResult(this.merge({blocks: blocksWithPiece}), Set([]));
        }

        // Remove cleared rows and shift blocks down to their new positions
        const newBlocks: Map<Position, Block> = blocksWithPiece
            .filter((block: Block, pos: Position) => !clearedRows.contains(pos.row)) // Remove cleared blocks
            .mapKeys(pos => new Position({
                row: pos.row - clearedRows.filter(clearedRow => clearedRow < pos.row).size, // Shift down by how many cleared blocks are below
                col: pos.col // Column stays the same
            }));
        return new MatrixLockPieceResult(this.merge({blocks: newBlocks}), clearedRows);
    }
}