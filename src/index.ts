import {TetrisGame} from "./tetrisGame";
import {DEFAULT_KEYMAP, KeyboardInputSource, parseKeyMap} from "./input";

const game: TetrisGame = new TetrisGame();
const kbd: KeyboardInputSource = new KeyboardInputSource(parseKeyMap(DEFAULT_KEYMAP));
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