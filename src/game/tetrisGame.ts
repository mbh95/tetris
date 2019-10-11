import {TetrisActionEvent} from "../events/actionEvent";
import {Matrix} from "./matrix";
import {PieceGenerator} from "./pieceGenerator";
import {FallingPieceState} from "./states/fallingPieceState";
import {TetrisProps} from "./tetrisProps";
import {TetrisSim} from "./tetrisSim";

export interface TetrisGame {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    handleActionEvent(e: TetrisActionEvent): TetrisGame;

    update(dt: number): TetrisGame;
}

export function newTetrisGame(matrix: Matrix, queue: PieceGenerator, gravityRate: number, lockDelay: number): TetrisGame {
    const newSim = TetrisSim.newTetrisSim(matrix, queue);
    const newProps = new TetrisProps(gravityRate, lockDelay);
    return new FallingPieceState(newSim, newProps);
}