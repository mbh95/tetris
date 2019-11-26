import {Record} from "immutable";
import {BlockColor} from "./blockColor";

interface BlockParams {
    color?: BlockColor;
}

export class Block extends Record({
    color: BlockColor.UNKNOWN
}) {
    readonly color!: BlockColor;

    constructor(params?: BlockParams) {
        params? super(params) : super();
    }
}