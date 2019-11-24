import {Record} from "immutable";
import {SimLockPieceResult} from "./sim/simLockPieceResult";

export enum TransitionType {
    UNKNOWN = "UNKNOWN",
    TICK = "TICK",
    GRAVITY = "GRAVITY",
    ACTION_SOFT_DROP = "ACTION_SOFT_DROP",
    ACTION_HARD_DROP = "ACTION_HARD_DROP",
    ACTION_MOVE_L = "ACTION_MOVE_L",
    ACTION_MOVE_R = "ACTION_MOVE_R",
    ACTION_ROTATE_CW = "ACTION_ROTATE_CW",
    ACTION_ROTATE_CCW = "ACTION_ROTATE_CCW",
    ACTION_HOLD = "ACTION_HOLD",
    GAME_OVER = "GAME_OVER"
}

interface TransitionDataParams {
    type: TransitionType;
    simLockPieceResult?: SimLockPieceResult;
}

export class TransitionData extends Record<TransitionDataParams>({
    type: TransitionType.UNKNOWN,
    simLockPieceResult: undefined
}) {
    readonly simLockPieceResult?: SimLockPieceResult;

    constructor(params?: TransitionDataParams) {
        params ? super(params) : super();
    }
}