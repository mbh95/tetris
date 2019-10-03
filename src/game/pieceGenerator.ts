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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            pieceProto: this.pieces.get(toRange(lcgNextResult.nextSeed, this.pieces.size))!
        };
    }
}

export class BagPieceGenerator implements PieceGenerator {
    readonly nextIndex: number;
    readonly bag: List<PiecePrototype>;
    readonly lcg: LCG;

    private constructor(nextIndex: number, bag: List<PiecePrototype>, lcg: LCG) {
        this.nextIndex = nextIndex;
        this.bag = bag;
        this.lcg = lcg;
    }

    static newBagPieceGenerator(bag: List<PiecePrototype>, seed?: bigint): BagPieceGenerator {
        if (seed === undefined) {
            seed = BigInt(Math.round(performance.now()));
        }
        return new BagPieceGenerator(bag.size, bag, new LCG(seed));
    }

    next(): { generator: PieceGenerator; pieceProto: PiecePrototype } {
        if (this.nextIndex < this.bag.size) {
            return {
                generator: new BagPieceGenerator(this.nextIndex + 1, this.bag, this.lcg),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                pieceProto: this.bag.get(this.nextIndex)!
            };
        }

        const shuffleResult = this.shuffle(this.bag, this.lcg);

        return {
            generator: new BagPieceGenerator(1, shuffleResult.newBag, shuffleResult.newLCG),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            pieceProto: shuffleResult.newBag.get(0)!
        };
    }

    private static shuffle(bag: List<PiecePrototype>, lcg: LCG): { newBag: List<PiecePrototype>; newLCG: LCG } {
        let curLCG = lcg;
        const bagArray: PiecePrototype[] = bag.toArray();
        for (let i = bag.size - 1; i > 0; i--) {
            const lcgNextResult = curLCG.next();
            const j = toRange(lcgNextResult.nextSeed, bag.size);
            curLCG = lcgNextResult.nextLCG;
            const temp = bagArray[i];
            bagArray[i] = bagArray[j];
            bagArray[j] = temp;
        }
        return {newBag: List(bagArray), newLCG: curLCG};
    }
}