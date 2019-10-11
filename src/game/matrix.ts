import {Block, MatrixBlock} from "./block";
import {Position} from "./position";
import {Piece} from "./piece";
import {Map, Range, Seq, Set} from "immutable";
import Indexed = Seq.Indexed;

export class LockPieceResult {
    readonly newMatrix: Matrix;
    readonly clearedRows: Set<number>;

    constructor(newMatrix: Matrix, clearedRows: Set<number>) {
        this.newMatrix = newMatrix;
        this.clearedRows = clearedRows;
    }
}

export class Matrix {
    readonly numRows: number;
    readonly numCols: number;
    readonly blocks: Map<Position, Block>;
    readonly spawnPos: Position;

    constructor(numRows: number, numCols: number, blocks?: Map<Position, Block>, spawnPos?: Position) {
        this.numRows = numRows;
        this.numCols = numCols;

        this.blocks = blocks ? blocks : Map();

        this.spawnPos = spawnPos ? spawnPos : new Position({row: (numRows / 2) - 1, col: (numCols / 2) - 1});
    }

    withNewBlocks(blocks: Map<Position, Block>): Matrix {
        return new Matrix(this.numRows, this.numCols, blocks, this.spawnPos);
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
     * @returns A LockPieceResult where the newMatrix is a new Matrix resulting from locking on success and this Matrix on failure.
     */
    lockPiece(piece: Piece): LockPieceResult {
        // If the piece doesn't fit in the matrix then return a no-op lock result.
        if (!this.isPieceValid(piece)) {
            return new LockPieceResult(this, Set([]));
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
            return new LockPieceResult(this.withNewBlocks(blocksWithPiece), Set([]));
        }

        // Remove cleared rows and shift blocks down to their new positions
        const newBlocks: Map<Position, Block> = blocksWithPiece
            .filter((block: Block, pos: Position) => !clearedRows.contains(pos.row)) // Remove cleared blocks
            .mapKeys(pos => new Position({
                row: pos.row - clearedRows.filter(clearedRow => clearedRow < pos.row).size, // Shift down by how many cleared blocks are below
                col: pos.col // Column stays the same
            }));
        return new LockPieceResult(this.withNewBlocks(newBlocks), clearedRows);
    }
}