export enum TetrisActionEventType {
    SOFT_DROP,
    HARD_DROP,
    MOVE_L,
    MOVE_R,
    ROTATE_CW,
    ROTATE_CCW,
    HOLD,
}

export interface TetrisActionEvent {
    readonly type: TetrisActionEventType;
}