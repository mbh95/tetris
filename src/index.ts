import {TetrisGame} from "./tetrisGame";
import {KeyboardInputSource, TetrisInputEventType} from "./input";
import {List, Map} from "immutable";

const game: TetrisGame = new TetrisGame();
const keyMap: Map<string, List<TetrisInputEventType>> = Map([["a", List([TetrisInputEventType.HARD_DROP])]]);
console.log(keyMap);
const kbd: KeyboardInputSource = new KeyboardInputSource(keyMap);
kbd.getInputEventDispatcher().registerHandler(game.getInputEventHandler());

kbd.init();

// Main loop
let prev: number = performance.now();

function update() {
    const now: number = performance.now();
    const dt = (now - prev) / 1000.0;
    game.update(dt);
    prev = now;
    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);