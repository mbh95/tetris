import {EventDispatcher, EventHandler} from "./events";
import {List, Map} from "immutable";

export enum TetrisInputEventType {
    SOFT_DROP,
    HARD_DROP,
    MOVE_L,
    MOVE_R,
    ROTATE_CW,
    ROTATE_CCW,
    HOLD,
}

export interface TetrisInputEvent {
    readonly type: TetrisInputEventType;
    readonly keyDown: boolean;
}

export interface TetrisInputEventSource {
    getInputEventDispatcher(): EventDispatcher<TetrisInputEvent>;
}

export interface TetrisInputEventSink {
    getInputEventHandler(): EventHandler<TetrisInputEvent>;
}

export class KeyboardInputSource implements TetrisInputEventSource {
    private dispatcher: EventDispatcher<TetrisInputEvent> = new EventDispatcher<TetrisInputEvent>();
    private keyToActionsMap: Map<string, List<TetrisInputEventType>>;

    // Necessary because passing this.handleKeyDown to addEventListener directly breaks "this" keyword.
    private keyDownListener: (e: KeyboardEvent) => void = (e) => this.handleKeyDown(e);
    private keyUpListener: (e: KeyboardEvent) => void = (e) => this.handleKeyUp(e);

    constructor(keyToActionsMap: Map<string, List<TetrisInputEventType>>) {
        this.keyToActionsMap = keyToActionsMap;
    }

    getInputEventDispatcher(): EventDispatcher<TetrisInputEvent> {
        return this.dispatcher;
    }

    init() {
        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('keyup', this.keyUpListener);
    }

    tearDown() {
        document.removeEventListener('keydown', this.keyDownListener);
        document.removeEventListener('keyup', this.keyUpListener);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.repeat || !this.keyToActionsMap.has(e.key)) {
            return;
        }
        for (const action of this.keyToActionsMap.get(e.key)!) {
            this.dispatcher.dispatch({ type: action, keyDown: true});
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        if (e.repeat || !this.keyToActionsMap.has(e.key)) {
            return;
        }
        for (const action of this.keyToActionsMap.get(e.key)!) {
            this.dispatcher.dispatch({ type: action, keyDown: false});
        }
    }
}
