import {Set} from "immutable";

export interface EventHandler<T> {
    handle(e: T): void;
}

export class BufferedEventHandler<T> implements EventHandler<T> {
    private eventBuffer: T[] = [];

    handle(e: T): void {
        this.eventBuffer.push(e);
    }

    hasNext(): boolean {
        return this.eventBuffer.length > 0;
    }

    next(): T | undefined {
        return this.eventBuffer.shift();
    }
}

export class EventDispatcher<T> {
    private registeredHandlers: Set<EventHandler<T>>;

    constructor() {
        this.registeredHandlers = Set();
    }

    registerHandler(h: EventHandler<T>): void {
        this.registeredHandlers = this.registeredHandlers.add(h);
    }

    removeRegisteredHandler(h: EventHandler<T>): void {
        this.registeredHandlers.remove(h);
    }

    dispatch(e: T): void {
        for (const h of this.registeredHandlers) {
            h.handle(e);
        }
    }

}