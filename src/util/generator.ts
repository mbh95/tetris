import {List} from "immutable";
import {Random} from "./random";

export interface Generator<T> {
    get(): T;
    next(): Generator<T>;
}

export class OrderedGenerator<T> implements Generator<T> {
    readonly bag: List<T>;
    readonly curIndex: number;

    constructor(bag: List<T>, curIndex: number) {
        if (curIndex < 0 || curIndex >= bag.size) {
            throw new Error(`Index out of bounds. Got ${curIndex}. Acceptable range: [0, ${bag.size})`);
        }
        this.bag = bag;
        this.curIndex = curIndex % this.bag.size;
    }

    get(): T {
        return this.bag.get(this.curIndex)!;
    }

    next(): Generator<T> {
        return new OrderedGenerator(this.bag, (this.curIndex + 1) % this.bag.size);
    }
}

export class RandomGenerator<T> implements Generator<T> {
    readonly bag: List<T>;
    readonly random: Random;

    constructor(bag: List<T>, random: Random) {
        this.bag = bag;
        this.random = random;
    }

    get(): T {
        return this.bag.get(this.random.getWithMod(this.bag.size))!;
    }

    next(): Generator<T> {
        return new RandomGenerator(this.bag, this.random.next());
    }
}

export class BagGenerator<T> implements Generator<T> {
    readonly bag: List<T>;
    readonly remaining: List<T>;
    readonly random: Random;

    private constructor(bag: List<T>, remaining: List<T>, random: Random) {
        if (bag.isEmpty() || remaining.isEmpty()) {
            throw new Error("Empty bag or remaining is invalid.");
        }
        this.bag = bag;
        this.remaining = remaining;
        this.random = random;
    }

    private curIndex(): number {
        return this.random.getWithMod(this.remaining.size);
    }

    get(): T {
        return this.remaining.get(this.curIndex())!;
    }

    next(): Generator<T> {
        if (this.remaining.size == 1) {
            return new BagGenerator(this.bag, this.bag, this.random.next());
        } else {
            return new BagGenerator(this.bag, this.remaining.remove(this.curIndex()), this.random.next());
        }
    }

    static newBagGenerator<T>(bag: List<T>, random: Random): BagGenerator<T> {
        return new BagGenerator(bag, bag, random);
    }
}