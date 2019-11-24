import {List} from "immutable";
import {TetrisActionEvent} from "../../events/actionEvent";
import {Matrix} from "./matrix/matrix";
import {Generator} from "../../util/generator";
import {PiecePrototype} from "./piece/piecePrototype";
import {FallingPieceState} from "./states/fallingPieceState";
import {TetrisProps} from "./tetrisProps";
import {TetrisSim} from "./sim/tetrisSim";
import {TransitionData} from "./transition";

export enum TetrisGameStateType {
    FALLING_PIECE = "FALLING_PIECE",
    DELAY = "DELAY",
    GAME_OVER = "GAME_OVER",
}

export interface TetrisGameState {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;
    readonly transitionData: List<TransitionData>;
    readonly type: TetrisGameStateType;

    handleActionEvent(e: TetrisActionEvent): TetrisGameState;

    tick(dt: number): TetrisGameState;

    clearTransitionData(): TetrisGameState;

    pushTransitionData(transitionData: TransitionData): TetrisGameState;

}

export function newTetrisGameState(matrix: Matrix, queue: Generator<PiecePrototype>, gravityRate: number, lockDelay: number, clearDelay: number): TetrisGameState {
    const newSim = TetrisSim.newTetrisSim(matrix, queue);
    const newProps = new TetrisProps(gravityRate, lockDelay, clearDelay);
    return new FallingPieceState({sim: newSim, props: newProps});
}