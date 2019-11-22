// TODO: Explore generalizing transitions to functions which map Piece->Piece
import {Position} from "../position";

export class Transition {
    readonly newOrientationId: number;
    readonly offset: Position;

    constructor(newOrientationId: number, offset: Position) {
        this.newOrientationId = newOrientationId;
        this.offset = offset;
    }
}