import {Record} from "immutable";

interface RowColumn {
    row: number;
    col: number;
}

const PositionRecord = Record({
    row: 0,
    col: 0,
});

export class Position extends PositionRecord implements RowColumn {
    readonly row!: number;
    readonly col!: number;

    constructor(props: RowColumn) {
        super(props);
    }

    translated(dPos: Position): Position {
        return this.translatedRC(dPos.row, dPos.col);
    }

    translatedRC(dRow: number, dCol: number): Position {
        return new Position({row: this.row + dRow, col: this.col + dCol});
    }
}