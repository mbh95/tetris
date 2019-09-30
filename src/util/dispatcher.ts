import {Set} from "immutable";

export class Dispatcher<T> {
    private registeredCallbacks: Set<(e: T)=>void>;

    constructor() {
        this.registeredCallbacks = Set();
    }

    registerCallback(callback: (e: T)=>void): void {
        this.registeredCallbacks = this.registeredCallbacks.add(callback);
    }

    removeRegisteredCallback(callback: (e: T)=>void): void {
        this.registeredCallbacks.remove(callback);
    }

    dispatch(e: T): void {
        const registeredCallbacksSnapshot = this.registeredCallbacks;
        for (const callback of registeredCallbacksSnapshot) {
            callback(e);
        }
    }
}