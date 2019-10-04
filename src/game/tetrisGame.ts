import {TetrisActionEvent, TetrisActionEventType} from "../events/actionEvent";
import {Matrix} from "./matrix";
import {Piece, PiecePrototype} from "./piece";
import {PieceGenerator} from "./pieceGenerator";
import {Position} from "./position";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, getGhostPiece, isPieceOnGround} from "./tetrisUtils";

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
            case TetrisActionEventType.HARD_DROP:
                return this.hardDrop().lockPiece().spawnNextPiece();
            case TetrisActionEventType.ROTATE_CW:
                return this.rotateCw();
            case TetrisActionEventType.ROTATE_CCW:
                return this.rotateCcw();
        }
        return this;
    }

    private movePiece(dPos: Position): FallingPieceState {
        const newPiece: Piece = this.fallingPiece.translated(dPos);
        if (this.matrix.isPieceValid(newPiece)) {
            return new FallingPieceState(this.matrix, newPiece, this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, this.canHold);
        }
        return this;
    }

    private hardDrop(): FallingPieceState {
        const newPiece: Piece = getGhostPiece(this.fallingPiece, this.matrix);
        if (this.matrix.isPieceValid(newPiece)) {
            return new FallingPieceState(this.matrix, newPiece, this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, this.canHold);
        }
        return this;
    }

    private rotateCw(): FallingPieceState {
        if (this.fallingPiece !== undefined) {
            return new FallingPieceState(this.matrix, this.fallingPiece.rotatedCw(piece=>this.matrix.isPieceValid(piece)), this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, this.canHold)
        }
        return this;
    }

    private rotateCcw(): FallingPieceState {
        if (this.fallingPiece !== undefined) {
            return new FallingPieceState(this.matrix, this.fallingPiece.rotatedCcw(piece=>this.matrix.isPieceValid(piece)), this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, this.canHold)
        }
        return this;
    }

    private lockPiece(): FallingPieceState {
        if (this.matrix.isPieceValid(this.fallingPiece)) {
            const lockResult = this.matrix.lockPiece(this.fallingPiece);
            return new FallingPieceState(lockResult.newMatrix, undefined, this.heldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, this.canHold);
        }
        return this;
    }

    private spawnNextPiece(): FallingPieceState {
        const queueNext = this.queue.next();
        const newQueue = queueNext.generator;
        const newPiece: Piece = new Piece(queueNext.pieceProto, 0, this.matrix.spawnPos);
        return new FallingPieceState(this.matrix, newPiece, this.heldPiece, newQueue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, true);
    }

    private hold(): FallingPieceState {
        if (this.canHold) {
            const newHeldPiece: PiecePrototype = this.fallingPiece.piecePrototype;
            if (this.heldPiece === undefined) {
                return new FallingPieceState(this.matrix, undefined, newHeldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, false);
            }
            const newPiece: Piece = new Piece(this.heldPiece, 0, this.matrix.spawnPos);
            return new FallingPieceState(this.matrix, newPiece, newHeldPiece, this.queue, this.gravityRate, this.lockDelay, this.gravityAccumulator, this.lockCountdown, false);
        }
        return this;
    }

    update(dt: number): FallingPieceState {
        if (isPieceOnGround(this.fallingPiece, this.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                return this.lockPiece();
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