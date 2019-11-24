import {AnyGameState} from "../tetris/state/tetrisGameState";

export interface TetrisStateTransitionEvent {
    prevState: AnyGameState;
    nextState: AnyGameState;
}