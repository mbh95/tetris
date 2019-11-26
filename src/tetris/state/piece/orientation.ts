import {Map} from "immutable";
import {Block} from "../block/block";
import {Position} from "../position";

export class Orientation {
    readonly blocks: Map<Position, Block>;

    constructor(blocks: Map<Position, Block>) {
        this.blocks = blocks;
    }
}