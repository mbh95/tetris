import {TetrisActionEvent, TetrisActionEventType} from "../../../events/actionEvent";
import {TetrisGame} from "../tetrisGame";
import {TetrisProps} from "../tetrisProps";
import {TetrisSim} from "../tetrisSim";
import {DIR_DOWN, DIR_LEFT, DIR_RIGHT, isPieceOnGround} from "../../util/tetrisUtils";

export class FallingPieceState implements TetrisGame {

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

    private setSimNoTransition(newSim: TetrisSim): FallingPieceState {
        if (newSim === this.sim) {
            // No change to sim
            return this;
        } else {
            return new FallingPieceState(newSim, this.props, this.gravityAccumulator, this.lockCountdown, this.canHold);
        }
    }

    private setSim(newSim: TetrisSim): TetrisGame {
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
                return this.hardDropAndLock();
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
        return this.setSimNoTransition(this.sim.movePiece(DIR_LEFT));
    }

    private moveR(): FallingPieceState {
        return this.setSimNoTransition(this.sim.movePiece(DIR_RIGHT));
    }

    private softDrop(): FallingPieceState {
        return this.setSimNoTransition(this.sim.movePiece(DIR_DOWN));
    }

    private hardDropAndLock(): TetrisGame {
        return this.setSimNoTransition(this.sim.hardDrop()).lockPieceAndSpawnNext();
    }

    private hold(): TetrisGame {
        if (this.canHold) {
            return this.setCanHold(false)
                .setGravityAccumulator(0)
                .setLockCountdown(this.props.lockDelay)
                .setSim(this.sim.swap());
        }
        return this;
    }

    private rotateCw(): FallingPieceState {
        return this.setSimNoTransition(this.sim.rotateCw());
    }

    private rotateCcw(): FallingPieceState {
        return this.setSimNoTransition(this.sim.rotateCcw());
    }

    private lockPieceAndSpawnNext(): TetrisGame {
        return this.setCanHold(true)
            .setGravityAccumulator(0)
            .setLockCountdown(this.props.lockDelay)
            .setSim(this.sim.lockPieceAndSpawnNext());
    }

    update(dt: number): TetrisGame {
        if (isPieceOnGround(this.sim.fallingPiece, this.sim.matrix)) {
            const newLockCountdown = this.lockCountdown - dt;
            if (newLockCountdown <= 0) {
                return this.lockPieceAndSpawnNext();
            }
            return this.setLockCountdown(newLockCountdown);
        } else {
            let newGravityAccumulator = this.gravityAccumulator + dt * this.props.gravityRate;
            let newPiece = this.sim.fallingPiece;
            while (newGravityAccumulator >= 1.0 && !isPieceOnGround(newPiece, this.sim.matrix)) {
                newPiece = newPiece.translated(DIR_DOWN);
                newGravityAccumulator -= 1.0;
            }
            return this.setGravityAccumulator(newGravityAccumulator).setSim(this.sim.setPiece(newPiece));
        }
    }
}