export class Queue<T> {
    private data: T[] = [];

    push(e: T): void {
        this.data.push(e);
    }

    pop(): T | undefined {
        return this.data.shift();
    }

    peek(): T |undefined {
        return this.data[0];
    }

    isEmpty(): boolean {
        return this.data.length <= 0;
    }
}