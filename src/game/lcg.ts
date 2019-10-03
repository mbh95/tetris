export class LCG {
    static readonly a: bigint = 6364136223846793005n;
    static readonly c: bigint = 1442695040888963407n;
    static readonly m: bigint = 1n << 64n;

    readonly seed: bigint;

    constructor(seed: bigint) {
        this.seed = seed;
    }

    next(): { nextSeed: bigint; nextLCG: LCG } {
        const nextSeed: bigint = ((this.seed * LCG.a) + LCG.c) % LCG.m;
        return {nextSeed, nextLCG: new LCG(nextSeed)};
    }
}

export function toRange(n: bigint, range: number): number {
    return Number(n % BigInt(range));
}