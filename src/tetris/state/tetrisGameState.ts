import {List} from "immutable";
import {TetrisActionEvent} from "../../events/actionEvent";
import {Matrix} from "./matrix/matrix";
import {Generator} from "../../util/generator";
import {PiecePrototype} from "./piece/piecePrototype";
import {DelayState} from "./states/delayState";
import {FallingPieceState} from "./states/fallingPieceState";
import {GameOverState} from "./states/gameOverState";
import {TetrisProps} from "./tetrisProps";
import {TetrisSim} from "./sim/tetrisSim";
import {StateTransition} from "./transition";

export enum TetrisGameStateType {
    FALLING_PIECE = "FALLING_PIECE",
    DELAY = "DELAY",
    GAME_OVER = "GAME_OVER",
}

export type AnyGameState = DelayState | FallingPieceState | GameOverState;

export interface TetrisGameState<T> {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;
    readonly transitionBuffer: List<StateTransition>;
    readonly type: TetrisGameStateType;

    handleActionEvent(e: TetrisActionEvent): DelayState | FallingPieceState | GameOverState;

    tick(dt: number): AnyGameState;

    clearTransitionBuffer(): T;

    pushTransition(transitionData: StateTransition): T;

}

export function newTetrisGameState(matrix: Matrix, queue: Generator<PiecePrototype>, gravityRate: number, lockDelay: number, clearDelay: number): AnyGameState {
    const newSim = TetrisSim.newTetrisSim(matrix, queue);
    const newProps = new TetrisProps(gravityRate, lockDelay, clearDelay);
    return new FallingPieceState({sim: newSim, props: newProps});
}