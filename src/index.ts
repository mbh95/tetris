import {PracticeScreen} from "./screens/practiceScreen";
// TODO: Use typings-for-css-modules-loader for real imports. See https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
require("./index.css");

// Set up canvas
const mainCanvas: HTMLCanvasElement = document.createElement("canvas");
mainCanvas.width = 800;
mainCanvas.height = 600;
document.getElementById("root")!.append(mainCanvas);

// Set up first screen
const practiceScreen = new PracticeScreen();
practiceScreen.init();

// Main loop
let prev: number = performance.now();

function update(): void {
    const now: number = performance.now();
    const dt = (now - prev) / 1000.0;
    practiceScreen.update(dt);
    practiceScreen.render(mainCanvas);
    prev = now;
    console.log(1.0 / (dt == 0 ? 0.0000001 : dt));
    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);