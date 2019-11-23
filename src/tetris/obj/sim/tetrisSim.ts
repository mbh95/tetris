import {Record} from "immutable";
import {Random} from "../../../util/random";
import {ALL_SRS_TETROMINOES} from "../../data/tetromino";
import {Matrix} from "../matrix/matrix";
import {MatrixLockPieceResult} from "../matrix/matrixLockPieceResult";
import {Piece} from "../piece/piece";
import {BagGenerator, Generator} from "../../../util/generator";
import {PiecePrototype} from "../piece/piecePrototype";
import {Position} from "../position";
import {getGhostPiece, getSpawnedPiece} from "../../util/tetrisUtils";
import {SimLockPieceResult} from "./simLockPieceResult";

interface TetrisSimParams {
    matrix?: Matrix;
    fallingPiece?: Piece;
    heldPiece?: PiecePrototype | undefined;
    queue?: Generator<PiecePrototype>;
}

export class TetrisSim extends Record<{
    matrix: Matrix;
    fallingPiece: Piece;
    heldPiece: PiecePrototype | undefined;
    queue: Generator<PiecePrototype>;
}>({
    matrix: new Matrix(),
    fallingPiece: new Piece(),
    heldPiece: undefined,
    queue: BagGenerator.newBagGenerator(ALL_SRS_TETROMINOES, new Random(0n)),
}) {
    readonly matrix!: Matrix;
    readonly fallingPiece!: Piece;
    readonly heldPiece!: PiecePrototype | undefined;
    readonly queue!: Generator<PiecePrototype>;

    constructor(params?: TetrisSimParams) {
        params ? super(params) : super();
    }

    movePiece(dPos: Position): TetrisSim {
        return this.merge({fallingPiece: this.fallingPiece.maybeTranslated(dPos, piece => this.matrix.isPieceValid(piece))});
    }

    hardDrop(): TetrisSim {
        return this.merge({fallingPiece: getGhostPiece(this.fallingPiece, this.matrix)});
    }

    rotateCw(): TetrisSim {
        return this.merge({fallingPiece: this.fallingPiece.maybeRotatedCw(piece => this.matrix.isPieceValid(piece))});
    }

    rotateCcw(): TetrisSim {
        return this.merge({fallingPiece: this.fallingPiece.maybeRotatedCcw(piece => this.matrix.isPieceValid(piece))});
    }

    lockPieceAndSpawnNext(): SimLockPieceResult {
        const matrixLockResult: MatrixLockPieceResult = this.matrix.lockPiece(this.fallingPiece);
        const newSim: TetrisSim = this.merge({
            matrix: matrixLockResult.newMatrix,
            fallingPiece: getSpawnedPiece(this.queue.get(), matrixLockResult.newMatrix),
            queue: this.queue.next()
        });
        return new SimLockPieceResult(newSim, matrixLockResult);
    }

    swap(): TetrisSim {
        if (this.heldPiece === undefined) {
            return this.merge({
                heldPiece: this.fallingPiece.piecePrototype,
                fallingPiece: getSpawnedPiece(this.queue.get(), this.matrix),
                queue: this.queue.next()
            });
        } else {
            return this.merge({
                heldPiece: this.fallingPiece.piecePrototype,
                fallingPiece: getSpawnedPiece(this.heldPiece, this.matrix),
            });
        }
    }

    static newTetrisSim(matrix: Matrix, queue: Generator<PiecePrototype>): TetrisSim {
        return new TetrisSim({
            matrix,
            fallingPiece: getSpawnedPiece(queue.get(), matrix),
            queue: queue.next()
        });
    }
}