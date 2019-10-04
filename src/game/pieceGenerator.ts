import {List} from "immutable";
import {LCG, toRange} from "./lcg";
import {PiecePrototype} from "./piece";

export interface PieceGenerator {
    next(): { generator: PieceGenerator; pieceProto: PiecePrototype };
}

export class RandomPieceGenerator implements PieceGenerator {
    readonly pieces: List<PiecePrototype>;
    readonly lcg: LCG;

    constructor(pieces: List<PiecePrototype>, lcg: LCG) {
        this.pieces = pieces;
        this.lcg = lcg;
    }

    next(): { generator: PieceGenerator; pieceProto: PiecePrototype } {
        const lcgNextResult = this.lcg.next();
        return {
            generator: new RandomPieceGenerator(this.pieces, lcgNextResult.nextLCG),
            pieceProto: this.pieces.get(toRange(lcgNextResult.nextSeed, 0, this.pieces.size))!
        };
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

    static newBagPieceGenerator(bag: List<PiecePrototype>, seed?: bigint): BagPieceGenerator {
        if (seed === undefined) {
            seed = BigInt(Math.round(performance.now()));
        }
        return new BagPieceGenerator(bag, bag, new LCG(seed));
    }

    next(): { generator: PieceGenerator; pieceProto: PiecePrototype } {
        if (this.remaining.size == 1) {
            return {
                generator: new BagPieceGenerator(this.bag, this.bag, this.lcg),
                pieceProto: this.remaining.get(0)!
            };
        }
        const lcgNextResult = this.lcg.next();
        const nextIndex = toRange(lcgNextResult.nextSeed, 0, this.remaining.size);
        return {
            generator: new BagPieceGenerator(this.bag, this.remaining.remove(nextIndex), lcgNextResult.nextLCG),
            pieceProto: this.remaining.get(nextIndex)!
        };
    }
}