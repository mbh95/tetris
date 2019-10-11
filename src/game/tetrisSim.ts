import {Matrix} from "./matrix";
import {Piece, PiecePrototype} from "./piece";
import {PieceGenerator} from "./pieceGenerator";
import {Position} from "./position";
import {getGhostPiece} from "./tetrisUtils";

export class TetrisSim {
    readonly matrix: Matrix;
    readonly fallingPiece: Piece;
    readonly heldPiece: PiecePrototype | undefined;
    readonly queue: PieceGenerator;

    constructor(matrix: Matrix, fallingPiece: Piece, heldPiece: PiecePrototype | undefined, queue: PieceGenerator) {
        this.matrix = matrix;
        this.fallingPiece = fallingPiece;
        this.heldPiece = heldPiece;
        this.queue = queue;
    }

    setMatrix(newMatrix: Matrix): TetrisSim {
        if (newMatrix !== this.matrix) {
            return new TetrisSim(newMatrix, this.fallingPiece, this.heldPiece, this.queue);
        }
        return this;
    }

    setPiece(newPiece: Piece): TetrisSim {
        if (newPiece !== this.fallingPiece) {
            return new TetrisSim(this.matrix, newPiece, this.heldPiece, this.queue);
        }
        return this;
    }

    setValidPiece(newPiece: Piece): TetrisSim {
        if (newPiece !== this.fallingPiece && this.matrix.isPieceValid(newPiece)) {
            return new TetrisSim(this.matrix, newPiece, this.heldPiece, this.queue);
        }
        return this;
    }

    setHeldPiece(newHeldPieceProto?: PiecePrototype): TetrisSim {
        if (newHeldPieceProto !== this.heldPiece) {
            return new TetrisSim(this.matrix, this.fallingPiece, newHeldPieceProto, this.queue);
        }
        return this;
    }

    setQueue(newQueue: PieceGenerator): TetrisSim {
        if (newQueue !== this.queue) {
            return new TetrisSim(this.matrix, this.fallingPiece, this.heldPiece, newQueue);
        }
        return this;
    }


    movePiece(dPos: Position): TetrisSim {
        return this.setValidPiece(this.fallingPiece.translated(dPos));
    }

    hardDrop(): TetrisSim {
        return this.setValidPiece(getGhostPiece(this.fallingPiece, this.matrix));
    }

    rotateCw(): TetrisSim {
        return this.setValidPiece(this.fallingPiece.rotatedCw(piece => this.matrix.isPieceValid(piece)));
    }

    rotateCcw(): TetrisSim {
        return this.setValidPiece(this.fallingPiece.rotatedCcw(piece => this.matrix.isPieceValid(piece)));
    }

    spawnPiece(pieceProto: PiecePrototype): TetrisSim {
        // Don't use setValidPiece because we want to allow spawning new pieces in an invalid position (e.g. game over)
        return this.setPiece(new Piece(pieceProto, 0, this.matrix.spawnPos));
    }

    spawnNext(): TetrisSim {
        const queueNext = this.queue.next();
        return this
            .spawnPiece(queueNext.pieceProto)
            .setQueue(queueNext.generator);
    }

    lockPiece(): TetrisSim {
        const lockResult = this.matrix.lockPiece(this.fallingPiece);
        return this.setMatrix(lockResult.newMatrix);
    }

    lockPieceAndSpawnNext(): TetrisSim {
        return this.lockPiece().spawnNext();
    }

    swap(): TetrisSim {
        const newHeldPiece: PiecePrototype = this.fallingPiece.piecePrototype;
        if (this.heldPiece === undefined) {
            return this
                .setHeldPiece(newHeldPiece)
                .spawnNext();
        } else {
            return this
                .setHeldPiece(newHeldPiece)
                .spawnPiece(this.heldPiece)
        }
    }

    static newTetrisSim(matrix: Matrix, queue: PieceGenerator): TetrisSim {
        const queueNext = queue.next();
        return new TetrisSim(matrix, new Piece(queueNext.pieceProto, 0, matrix.spawnPos), undefined, queueNext.generator);
    }
}