import {Record} from "immutable";

interface BlockParams {
    colorId?: number;
}

export class Block extends Record({
    colorId: 0
}) {
    readonly colorId!: number;

    constructor(params?: BlockParams) {
        params? super(params) : super();
    }
}