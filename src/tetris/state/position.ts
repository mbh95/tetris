import {Record} from "immutable";

interface PositionParams {
    row?: number;
    col?: number;
}

export class Position extends Record({
    row: 0,
    col: 0,
}) {
    readonly row!: number;
    readonly col!: number;

    constructor(params?: PositionParams) {
        params? super(params) : super();
    }

    translated(dPos: Position): Position {
        return this.translatedRC(dPos.row, dPos.col);
    }

    translatedRC(dRow: number, dCol: number): Position {
        return this.merge({row: this.row + dRow, col: this.col + dCol});
    }
}