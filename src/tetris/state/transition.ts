import {Set} from "immutable";
import {Matrix} from "./matrix/matrix";
import {Piece} from "./piece/piece";
import {AnyGameState} from "./tetrisGameState";

export enum TransitionType {
    TIME_LOCK = "TIME_LOCK",
    GRAVITY_FALL = "GRAVITY_FALL",
    SOFT_DROP_FALL = "SOFT_DROP_FALL",
    HARD_DROP_FALL = "HARD_DROP_FALL",
    HARD_DROP_LOCK = "HARD_DROP_LOCK",
    MOVE_L = "MOVE_L",
    MOVE_R = "MOVE_R",
    ROTATE_CW = "ROTATE_CW",
    ROTATE_CCW = "ROTATE_CCW",
    ACTION_HOLD = "ACTION_HOLD",
    GAME_OVER = "GAME_OVER"
}

export interface LockData {
    readonly prevMatrix: Matrix;
    readonly newMatrix: Matrix;
    readonly lockedPiece: Piece;
    readonly clearedRows: Set<number>;
}

export interface TransitionData {
    readonly transitionType: TransitionType;
    readonly lockData?: LockData;
}

export class StateTransition {
    readonly beforeState: AnyGameState;
    readonly afterState: AnyGameState;
    readonly transitionData: TransitionData;

    constructor(beforeState: AnyGameState, afterState: AnyGameState, data: TransitionData) {
        this.beforeState = beforeState;
        this.afterState = afterState;
        this.transitionData = data;
    }
}

const pieceChangeTransitionSet: Set<TransitionType> = Set([
    TransitionType.GRAVITY_FALL,
    TransitionType.SOFT_DROP_FALL,
    TransitionType.HARD_DROP_FALL,
    TransitionType.MOVE_L,
    TransitionType.MOVE_R,
    TransitionType.ROTATE_CW,
    TransitionType.ROTATE_CCW,
    TransitionType.ACTION_HOLD]);

export function isPieceChangeTransition(transitionType: TransitionType): boolean {
    return pieceChangeTransitionSet.contains(transitionType);
}

export function isRotationTransition(transitionType: TransitionType): boolean {
    return transitionType === TransitionType.ROTATE_CW || transitionType === TransitionType.ROTATE_CCW;
}

export function isPieceLockTransition(transitionType: TransitionType): boolean {
    return transitionType === TransitionType.TIME_LOCK || transitionType === TransitionType.HARD_DROP_LOCK;
}