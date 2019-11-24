import {MatrixLockPieceResult} from "../matrix/matrixLockPieceResult";
import {TetrisSim} from "./tetrisSim";

export class SimLockPieceResult {
    readonly newSim: TetrisSim;
    readonly matrixLockPieceResult: MatrixLockPieceResult;

    constructor(newSim: TetrisSim, matrixLockPieceResult: MatrixLockPieceResult) {
        this.newSim = newSim;
        this.matrixLockPieceResult = matrixLockPieceResult;
    }
}