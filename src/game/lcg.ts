// Immutable linear congruential generator
//
// https://en.wikipedia.org/wiki/Linear_congruential_generator
import {FuncList} from "../util/funcList";

export class LCG implements FuncList<bigint> {
    static readonly a: bigint = 6364136223846793005n;
    static readonly c: bigint = 1442695040888963407n;
    static readonly m: bigint = 1n << 64n;

    readonly seed: bigint;

    constructor(seed: bigint) {
        this.seed = seed;
    }

    head(): bigint {
        return this.seed;
    }

    tail(): LCG {
        const nextSeed: bigint = ((this.seed * LCG.a) + LCG.c) % LCG.m;
        return new LCG(nextSeed);
    }
}

export function bigintToRange(big: bigint, low: number, high: number): number {
    return low + Number(big % BigInt(high - low));
}