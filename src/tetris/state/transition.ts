import {List, Record, Set} from "immutable";
import {Matrix} from "./matrix/matrix";
import {Piece} from "./piece/piece";
import {SimLockPieceResult} from "./sim/simLockPieceResult";

export enum TransitionType {
    UNKNOWN = "UNKNOWN",
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

interface LockData {
    prevMatrix: Matrix;
    newMatrix: Matrix;
    lockedPiece: Piece;
    clearedRows: Set<number>;
}

interface TransitionDataParams {
    type: TransitionType;
    lockData?: LockData;
}

export class TransitionData extends Record<TransitionDataParams>({
    type: TransitionType.UNKNOWN,
    lockData: undefined
}) {
    readonly lockData?: LockData;

    constructor(params?: TransitionDataParams) {
        params ? super(params) : super();
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

export function isPieceChangeTransition(transitionType: TransitionType) {
    return pieceChangeTransitionSet.contains(transitionType);
}

export function isRotationTransition(transitionType: TransitionType) {
    return transitionType === TransitionType.ROTATE_CW || transitionType === TransitionType.ROTATE_CCW;
}

export function isPieceLockTransition(transitionType: TransitionType) {
    return transitionType === TransitionType.TIME_LOCK || transitionType === TransitionType.HARD_DROP_LOCK;
}