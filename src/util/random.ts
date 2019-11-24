// Immutable linear congruential generator
//
// https://en.wikipedia.org/wiki/Linear_congruential_generator

const A = 6364136223846793005n;
const C = 1442695040888963407n;
const M = BigInt(1) << BigInt(64);

function nextVal(cur: bigint): bigint {
    return ((cur * A) + C) % M;
}

function bigintToNumberInRange(big: bigint, low: number, high: number): number {
    return low + Number(big % BigInt(high - low));
}

export class Random {
    readonly value: bigint;

    constructor(seed: bigint) {
        this.value = nextVal(seed);
    }

    getWithMod(high: number): number {
        return bigintToNumberInRange(this.value, 0, high);
    }

    getInRange(low: number, high: number): number {
        return bigintToNumberInRange(this.value, low, high);
    }

    next(): Random {
        return new Random(this.value);
    }
}