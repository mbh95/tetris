import {TetrisActionEvent, TetrisActionEventType} from "../events/actionEvent";
import {PieceGenerator} from "./pieceGenerator";
import {Matrix} from "./matrix";
import {Piece, PiecePrototype} from "./piece";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "./tetrisUtils";
import {Position} from "./position";

export interface TetrisGame {
    readonly matrix: Matrix;
    readonly fallingPiece: Piece | undefined;
    readonly heldPiece: PiecePrototype | undefined;
    readonly queue: PieceGenerator;

    readonly gravityRate: number;
    readonly lockDelay: number;
    handleActionEvent(e: TetrisActionEvent): TetrisGame;

    update(dt: number): TetrisGame;
}

class FallingPieceState implements TetrisGame {
    readonly matrix: Matrix;
    readonly fallingPiece: Piece;
    readonly heldPiece: PiecePrototype | undefined;
    readonly queue: PieceGenerator;

    readonly gravityRate: number;
    readonly lockDelay: number;

    readonly gravityAccumulator: number;
    readonly lockCountdown: number;
    readonly canHold: boolean;

    constructor(matrix: Matrix,
                fallingPiece: Piece | undefined,
                heldPiece: PiecePrototype | undefined,
                queue: PieceGenerator,
                gravityRate: number,
                lockDelay: number,
                gravityAccumulator = 0.0,
                lockCountdown = lockDelay,
                canHold = true) {
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
        this.lockDelay = lockDelay;

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
            return new FallingPieceState(this.matrix, newPiece, this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, this.canHold);
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
                return new FallingPieceState(this.matrix, newPiece, newHeldPiece, newQueue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, false);
            }
            const newPiece: Piece = new Piece(this.heldPiece, 0, this.matrix.spawnPos);
            return new FallingPieceState(this.matrix, newPiece, newHeldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, false);
        }
        return this;
    }

    update(dt: number): TetrisGame {
        if (isPieceOnGround(this.fallingPiece, this.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                const lockResult = this.matrix.lockPiece(this.fallingPiece);
                return new FallingPieceState(lockResult.newMatrix, undefined, this.heldPiece, this.queue, this.gravityRate, this.lockDelay);
            }
            return new FallingPieceState(this.matrix, this.fallingPiece, this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, newLockCountdown, this.canHold);
        } else {
            let newGravityAccumulator = this.gravityAccumulator + dt * this.gravityRate;
            let newPiece = this.fallingPiece;
            while (newGravityAccumulator >= 1.0 && !isPieceOnGround(newPiece, this.matrix)) {
                newPiece = newPiece.translated(DIR_DOWN);
                newGravityAccumulator -= 1.0;
            }
            return new FallingPieceState(this.matrix, newPiece, this.heldPiece, this.queue, this.gravityRate, this.lockDelay, newGravityAccumulator, this.lockCountdown, this.canHold);
        }
    }
}

export function newTetrisGame(matrix: Matrix, queue: PieceGenerator, gravityRate: number, lockDelay: number): TetrisGame {
    return new FallingPieceState(matrix, undefined, undefined, queue, gravityRate, lockDelay);
}