import {TetrisActionEvent} from "../../events/actionEvent";
import {Matrix} from "../obj/matrix/matrix";
import {Generator} from "../../util/generator";
import {PiecePrototype} from "../obj/piece/piecePrototype";
import {FallingPieceState} from "./states/fallingPieceState";
import {TetrisProps} from "./tetrisProps";
import {TetrisSim} from "../obj/sim/tetrisSim";

export interface TetrisGame {
    readonly sim: TetrisSim;
    readonly props: TetrisProps;

    handleActionEvent(e: TetrisActionEvent): TetrisGame;

    tick(dt: number): TetrisGame;
}

export function newTetrisGame(matrix: Matrix, queue: Generator<PiecePrototype>, gravityRate: number, lockDelay: number, clearDelay: number): TetrisGame {
    const newSim = TetrisSim.newTetrisSim(matrix, queue);
    const newProps = new TetrisProps(gravityRate, lockDelay, clearDelay);
    return new FallingPieceState({sim: newSim, props: newProps});
}