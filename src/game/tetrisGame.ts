import {TetrisActionEvent, TetrisActionEventType} from "../events/actionEvent";
import {PieceGenerator} from "./state/pieceGenerator";
import {Matrix} from "./state/matrix";
import {Piece, PiecePrototype} from "./state/piece";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "./tetrisUtils";
import {Position} from "./state/position";

export interface TetrisGame {
    readonly matrix: Matrix;
    readonly fallingPiece: Piece | undefined;
    readonly heldPiece: PiecePrototype | undefined;
    readonly queue: PieceGenerator;

    handleActionEvent(e: TetrisActionEvent): TetrisGame;

    update(dt: number): TetrisGame;
}

class FallingPieceState implements TetrisGame {
    readonly matrix: Matrix;
    readonly fallingPiece: Piece;
    readonly heldPiece: PiecePrototype | undefined;
    readonly queue: PieceGenerator;

    readonly gravityRate: number;
    readonly gravityAccumulator: number;
    readonly lockCountdown: number;
    readonly canHold: boolean;

    constructor(matrix: Matrix, fallingPiece: Piece | undefined, heldPiece: PiecePrototype | undefined, queue: PieceGenerator, gravityRate: number, gravityAccumulator = 0.0, lockCountdown = 3.0, canHold = true) {
        this.matrix = matrix;
        this.heldPiece = heldPiece;
        if (fallingPiece === undefined) {
            const queueNext = queue.next();
            this.fallingPiece = new Piece(queueNext.pieceProto, 0, matrix.spawnPos);
            this.queue = queueNext.generator;
        } else {
            this.fallingPiece = fallingPiece;
            this.queue = queue;
        }
        this.gravityRate = gravityRate;
        this.gravityAccumulator = gravityAccumulator;
        this.lockCountdown = lockCountdown;
        this.canHold = canHold;
    }

    handleActionEvent(e: TetrisActionEvent): TetrisGame {
        switch (e.type) {
            case TetrisActionEventType.MOVE_L:
                return this.movePiece(DIR_LEFT);
            case TetrisActionEventType.MOVE_R:
                return this.movePiece(DIR_RIGHT);
            case TetrisActionEventType.SOFT_DROP:
                return this.movePiece(DIR_DOWN);
            case TetrisActionEventType.HOLD:
                return this.hold();
        }
        return this;
    }

    private movePiece(dPos: Position): TetrisGame {
        const newPiece: Piece = this.fallingPiece.translated(dPos);
        if (this.matrix.isPieceValid(newPiece)) {
            return new FallingPieceState(this.matrix, newPiece, this.heldPiece, this.queue, this.gravityRate, this.gravityAccumulator, this.lockCountdown, this.canHold);
        }
        return this;
    }

    private hold(): TetrisGame {
        if (this.canHold) {
            const newHeldPiece: PiecePrototype = this.fallingPiece.piecePrototype;
            if (this.heldPiece === undefined) {
                const queueNext = this.queue.next();
                const newQueue = queueNext.generator;
                const newPiece: Piece = new Piece(queueNext.pieceProto, 0, this.matrix.spawnPos);
                return new FallingPieceState(this.matrix, newPiece, newHeldPiece, newQueue, this.gravityRate, this.gravityAccumulator, this.lockCountdown, false);
            }
            const newPiece: Piece = new Piece(this.heldPiece, 0, this.matrix.spawnPos);
            return new FallingPieceState(this.matrix, newPiece, newHeldPiece, this.queue, this.gravityRate, this.gravityAccumulator, this.lockCountdown, false);
        }
        return this;
    }

    update(dt: number): TetrisGame {
        if (isPieceOnGround(this.fallingPiece, this.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                const lockResult = this.matrix.lockPiece(this.fallingPiece);
                return new FallingPieceState(lockResult.newMatrix, undefined, this.heldPiece, this.queue, this.gravityRate);
            }
            return new FallingPieceState(this.matrix, this.fallingPiece, this.heldPiece, this.queue, this.gravityRate, this.gravityAccumulator, newLockCountdown, this.canHold);
        } else {
            let newGravityAccumulator = this.gravityAccumulator + dt * this.gravityRate;
            let newPiece = this.fallingPiece;
            while (newGravityAccumulator >= 1.0 && !isPieceOnGround(newPiece, this.matrix)) {
                newPiece = newPiece.translated(DIR_DOWN);
                newGravityAccumulator -= 1.0;
            }
            return new FallingPieceState(this.matrix, newPiece, this.heldPiece, this.queue, this.gravityRate, newGravityAccumulator, this.lockCountdown, this.canHold);
        }
    }
}