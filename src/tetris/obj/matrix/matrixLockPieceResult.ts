import {Set} from "immutable";
import {Matrix} from "./matrix";

export class MatrixLockPieceResult {
    readonly newMatrix: Matrix;
    readonly clearedRows: Set<number>;

    constructor(newMatrix: Matrix, clearedRows: Set<number>) {
        this.newMatrix = newMatrix;
        this.clearedRows = clearedRows;
    }
}