import {TetrisGameState} from "../tetris/state/tetrisGameState";

export interface TetrisStateTransitionEvent {
    prevState: TetrisGameState;
    nextState: TetrisGameState;
}