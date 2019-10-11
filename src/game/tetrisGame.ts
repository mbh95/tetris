import {TetrisActionEvent, TetrisActionEventType} from "../events/actionEvent";
import {Matrix} from "./matrix";
import {PieceGenerator} from "./pieceGenerator";
import {TetrisSim} from "./tetrisSim";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "./tetrisUtils";

export class TetrisProps {
    readonly gravityRate: number;
    readonly lockDelay: number;

    constructor(gravityRate: number, lockDelay: number) {
        this.gravityRate = gravityRate;
        this.lockDelay = lockDelay;
    }
}

export interface TetrisGame {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    handleActionEvent(e: TetrisActionEvent): TetrisGame;

    update(dt: number): TetrisGame;
}

class FallingPieceState implements TetrisGame {

    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    readonly gravityAccumulator: number;
    readonly lockCountdown: number;
    readonly canHold: boolean;

    constructor(sim: TetrisSim,
                props: TetrisProps,
                gravityAccumulator = 0.0,
                lockCountdown = props.lockDelay,
                canHold = true) {
        this.sim = sim;
        this.props = props;
        this.gravityAccumulator = gravityAccumulator;
        this.lockCountdown = lockCountdown;
        this.canHold = canHold;
    }

    private setSim(newSim: TetrisSim): FallingPieceState {
        if (newSim === this.sim) {
            // No change to sim
            return this;
        } else if (!newSim.matrix.isPieceValid(newSim.fallingPiece)) {
            // GAME OVER;
            return this;
        } else {
            return new FallingPieceState(newSim, this.props, this.gravityAccumulator, this.lockCountdown, this.canHold);
        }
    }

    private setGravityAccumulator(newGravityAccumulator: number): FallingPieceState {
        if (newGravityAccumulator != this.gravityAccumulator) {
            return new FallingPieceState(this.sim, this.props, newGravityAccumulator, this.lockCountdown, this.canHold);
        }
        return this;
    }

    private setLockCountdown(newLockCountdown: number): FallingPieceState {
        if (newLockCountdown != this.lockCountdown) {
            return new FallingPieceState(this.sim, this.props, this.gravityAccumulator, newLockCountdown, this.canHold);
        }
        return this;
    }

    private setCanHold(newCanHold: boolean): FallingPieceState {
        if (newCanHold != this.canHold) {
            return new FallingPieceState(this.sim, this.props, this.gravityAccumulator, this.lockCountdown, newCanHold);
        }
        return this;
    }

    handleActionEvent(e: TetrisActionEvent): TetrisGame {
        switch (e.type) {
            case TetrisActionEventType.MOVE_L:
                return this.moveL();
            case TetrisActionEventType.MOVE_R:
                return this.moveR();
            case TetrisActionEventType.SOFT_DROP:
                return this.softDrop();
            case TetrisActionEventType.HARD_DROP:
                return this.hardDrop();
            case TetrisActionEventType.HOLD:
                return this.hold();
            case TetrisActionEventType.ROTATE_CW:
                return this.rotateCw();
            case TetrisActionEventType.ROTATE_CCW:
                return this.rotateCcw();
        }
        return this;
    }

    private moveL(): FallingPieceState {
        return this.setSim(this.sim.movePiece(DIR_LEFT));
    }

    private moveR(): FallingPieceState {
        return this.setSim(this.sim.movePiece(DIR_RIGHT));
    }

    private softDrop(): FallingPieceState {
        return this.setSim(this.sim.movePiece(DIR_DOWN));
    }

    private hardDrop(): FallingPieceState {
        return this.setSim(this.sim.hardDrop()).lockPiece();
    }

    private hold(): FallingPieceState {
        if (this.canHold) {
            return this
                .setSim(this.sim.swapToHold())
                .setCanHold(false)
                .setLockCountdown(this.props.lockDelay)
                .setGravityAccumulator(0);
        }
        return this;
    }

    private rotateCw(): FallingPieceState {
        return this.setSim(this.sim.rotateCw());
    }

    private rotateCcw(): FallingPieceState {
        return this.setSim(this.sim.rotateCcw());
    }

    private lockPiece(): FallingPieceState {
        return this
            .setSim(this.sim.lockPiece())
            .setLockCountdown(this.props.lockDelay)
            .setGravityAccumulator(0)
            .setCanHold(true);
    }

    update(dt: number): FallingPieceState {
        if (isPieceOnGround(this.sim.fallingPiece, this.sim.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                return this.lockPiece();
            }
            return this.setLockCountdown(newLockCountdown);
        } else {
            let newGravityAccumulator = this.gravityAccumulator + dt * this.props.gravityRate;
            let newPiece = this.sim.fallingPiece;
            while (newGravityAccumulator >= 1.0 && !isPieceOnGround(newPiece, this.sim.matrix)) {
                newPiece = newPiece.translated(DIR_DOWN);
                newGravityAccumulator -= 1.0;
            }
            return this.setSim(this.sim.setPiece(newPiece)).setGravityAccumulator(newGravityAccumulator);
        }
    }
}

export function newTetrisGame(matrix: Matrix, queue: PieceGenerator, gravityRate: number, lockDelay: number): TetrisGame {
    const newSim = TetrisSim.newTetrisSim(matrix, queue);
    const newProps = new TetrisProps(gravityRate, lockDelay);
    return new FallingPieceState(newSim, newProps);
}