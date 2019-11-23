import {PracticeScreen} from "./screens/practiceScreen";
import "./index.css";

// Set up canvas
const mainCanvas: HTMLCanvasElement = document.createElement("canvas");
mainCanvas.width = 800;
mainCanvas.height = 600;
const mainCanvasCtx: CanvasRenderingContext2D = mainCanvas.getContext("2d")!;

document.getElementById("root")!.append(mainCanvas);

// Set up first screen
const practiceScreen = new PracticeScreen();
practiceScreen.init();
//
// // Main loop
let prev: number = performance.now();
//
function tick(): void {
    const now: number = performance.now();
    const dt = (now - prev) / 1000.0;

    practiceScreen.tick(dt);
    mainCanvasCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    practiceScreen.render(mainCanvas);
    prev = now;
    console.log(1.0 / (dt == 0 ? 0.0000001 : dt));
    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);