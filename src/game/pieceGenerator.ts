import {List} from "immutable";
import {FuncList} from "../util/funcList";
import {bigintToRange, LCG} from "./lcg";
import {PiecePrototype} from "./piece";

export type PieceGenerator = FuncList<PiecePrototype>;

export class RandomPieceGenerator implements PieceGenerator {
    readonly pieces: List<PiecePrototype>;
    readonly lcg: LCG;

    constructor(pieces: List<PiecePrototype>, lcg: LCG) {
        this.pieces = pieces;
        this.lcg = lcg;
    }

    head(): PiecePrototype {
        return this.pieces.get(bigintToRange(this.lcg.head(), 0, this.pieces.size))!;
    }

    tail(): PieceGenerator {
        return new RandomPieceGenerator(this.pieces, this.lcg.tail());
    }
}

export class BagPieceGenerator implements PieceGenerator {
    readonly bag: List<PiecePrototype>;
    readonly remaining: List<PiecePrototype>;
    readonly lcg: LCG;

    private constructor(bag: List<PiecePrototype>, remaining: List<PiecePrototype>, lcg: LCG) {
        if (bag.isEmpty() || remaining.isEmpty()) {
            throw new Error("Empty bag or remaining is invalid.");
        }
        this.bag = bag;
        this.remaining = remaining;
        this.lcg = lcg;
    }

    private headIndex(): number {
        return bigintToRange(this.lcg.head(), 0, this.remaining.size);
    }

    head(): PiecePrototype {
        return this.remaining.get(this.headIndex())!;
    }

    tail(): PieceGenerator {
        if (this.remaining.size == 1) {
            return new BagPieceGenerator(this.bag, this.bag, this.lcg.tail());
        } else {
            return new BagPieceGenerator(this.bag, this.remaining.remove(this.headIndex()), this.lcg.tail());
        }
    }

    static newBagPieceGenerator(bag: List<PiecePrototype>, seed?: bigint): BagPieceGenerator {
        if (seed === undefined) {
            seed = BigInt(Math.round(Date.now()));
        }
        // Throw away the first value since it was given to us.
        return new BagPieceGenerator(bag, bag, new LCG(seed).tail());
    }
}