export enum TetrisInputEventType {
    SOFT_DROP,
    HARD_DROP,
    MOVE_L,
    MOVE_R,
    ROTATE_CW,
    ROTATE_CCW,
    HOLD,
}

export interface TetrisInputEvent {
    readonly type: TetrisInputEventType;
    readonly keyDown: boolean;
}