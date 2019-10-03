import {PracticeScreen} from "./screens/practiceScreen";

const practiceScreen = new PracticeScreen();

practiceScreen.init();

// Main loop
let prev: number = performance.now();

function update(): void {
    const now: number = performance.now();
    const dt = (now - prev) / 1000.0;
    practiceScreen.update(dt);
    prev = now;
    console.log(1.0 / (dt == 0 ? 0.0000001 : dt));
    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);