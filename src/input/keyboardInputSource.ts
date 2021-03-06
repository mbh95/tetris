import {List, Map} from "immutable";
import {Dispatcher} from "../util/dispatcher";
import {TetrisInputEvent, TetrisInputEventType} from "../events/inputEvent";

export interface KeyMap {
    readonly softDropKeys: List<string>;
    readonly hardDropKeys: List<string>;
    readonly moveLeftKeys: List<string>;
    readonly moveRightKeys: List<string>;
    readonly rotateCwKeys: List<string>;
    readonly rotateCcwKeys: List<string>;
    readonly holdKeys: List<string>;
}

function addAllKeysToAction(map: Map<string, List<TetrisInputEventType>>, keyCodes: List<string>, action: TetrisInputEventType): Map<string, List<TetrisInputEventType>> {
    let keyToAction: Map<string, List<TetrisInputEventType>> = map;
    keyCodes.forEach(keyCode => {
        keyToAction = keyToAction.set(keyCode, keyToAction.get(keyCode, List()).push(action));
    });
    return keyToAction;
}

export function parseKeyMap(keyMap: KeyMap): Map<string, List<TetrisInputEventType>> {
    let keyToAction: Map<string, List<TetrisInputEventType>> = Map();
    keyToAction = addAllKeysToAction(keyToAction, keyMap.softDropKeys, TetrisInputEventType.SOFT_DROP);
    keyToAction = addAllKeysToAction(keyToAction, keyMap.hardDropKeys, TetrisInputEventType.HARD_DROP);
    keyToAction = addAllKeysToAction(keyToAction, keyMap.moveLeftKeys, TetrisInputEventType.MOVE_L);
    keyToAction = addAllKeysToAction(keyToAction, keyMap.moveRightKeys, TetrisInputEventType.MOVE_R);
    keyToAction = addAllKeysToAction(keyToAction, keyMap.rotateCwKeys, TetrisInputEventType.ROTATE_CW);
    keyToAction = addAllKeysToAction(keyToAction, keyMap.rotateCcwKeys, TetrisInputEventType.ROTATE_CCW);
    keyToAction = addAllKeysToAction(keyToAction, keyMap.holdKeys, TetrisInputEventType.HOLD);
    return keyToAction;
}

/**
 * Maps lists of keys (event.code) to Tetris actions in a human readable+modifiable way.
 */
export const DEFAULT_KEYMAP: KeyMap = {
    hardDropKeys: List(["Space"]),
    softDropKeys: List(["ArrowDown"]),
    moveLeftKeys: List(["ArrowLeft"]),
    moveRightKeys: List(["ArrowRight"]),
    rotateCwKeys: List(["KeyX", "ArrowUp"]),
    rotateCcwKeys: List(["KeyZ"]),
    holdKeys: List(["ShiftLeft"]),
};

/**
 * Generates TetrisInputEvents from js keyup/keydown listeners.
 */
export class KeyboardInputSource {
    private readonly dispatcher: Dispatcher<TetrisInputEvent> = new Dispatcher<TetrisInputEvent>();
    private readonly keyToActionsMap: Map<string, List<TetrisInputEventType>>;

    // Necessary because passing this.handleKeyDown to addEventListener directly breaks "this" keyword.
    private keyDownListener: (e: KeyboardEvent) => void = (e) => this.handleKeyDown(e);
    private keyUpListener: (e: KeyboardEvent) => void = (e) => this.handleKeyUp(e);

    constructor(keyToActionsMap?: Map<string, List<TetrisInputEventType>>) {
        if (keyToActionsMap === undefined) {
            keyToActionsMap = parseKeyMap(DEFAULT_KEYMAP);
        }
        this.keyToActionsMap = keyToActionsMap;
    }

    registerInputHandler(callback: (e: TetrisInputEvent) => void): void {
        this.dispatcher.registerCallback(callback);
    }

    init(): void {
        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('keyup', this.keyUpListener);
    }

    tearDown(): void {
        document.removeEventListener('keydown', this.keyDownListener);
        document.removeEventListener('keyup', this.keyUpListener);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.repeat || !this.keyToActionsMap.has(e.code)) {
            return;
        }
        for (const action of this.keyToActionsMap.get(e.code)!) {
            this.dispatcher.dispatch({type: action, keyDown: true});
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        if (e.repeat || !this.keyToActionsMap.has(e.code)) {
            return;
        }
        for (const action of this.keyToActionsMap.get(e.code)!) {
            this.dispatcher.dispatch({type: action, keyDown: false});
        }
    }
}