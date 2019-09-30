import {TetrisGame} from "./game/tetrisGame";
import {DEFAULT_KEYMAP, KeyboardInputSource, parseKeyMap} from "./input/keyboardInputSource";
import {VirtualGamepad} from "./input/virtualGamepad";

const game: TetrisGame = new TetrisGame();
const kbd: KeyboardInputSource = new KeyboardInputSource(parseKeyMap(DEFAULT_KEYMAP));
const virtualGamepad: VirtualGamepad = new VirtualGamepad(0.15, 30);

kbd.registerInputHandler(virtualGamepad.inputHandler);
virtualGamepad.registerActionHandler(game.tetrisActionCallback);

kbd.init();

// Main loop
let prev: number = performance.now();

function update() {
    const now: number = performance.now();
    const dt = (now - prev) / 1000.0;
    virtualGamepad.update(dt);
    game.update(dt);
    prev = now;
    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);