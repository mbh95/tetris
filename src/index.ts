import {PracticeScreen} from "./screens/practiceScreen";
import "./index.css";
import Stats from "stats.js";

// Set up canvas
const mainCanvas: HTMLCanvasElement = document.createElement("canvas");
mainCanvas.id = "mainCanvas";
mainCanvas.width = 800;
mainCanvas.height = 600;
const mainCanvasCtx: CanvasRenderingContext2D = mainCanvas.getContext("2d")!;

const prevMainCanvas = document.getElementById("mainCanvas");
if (prevMainCanvas !== null) {
    prevMainCanvas.remove();
}

document.getElementById("root")!.append(mainCanvas);

// Set up first screen
const practiceScreen = new PracticeScreen();
practiceScreen.init();

// // Main loop
let prev: number = performance.now();


const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function tick(): void {
    stats.begin();

    const now: number = performance.now();
    const dt = (now - prev) / 1000.0;

    practiceScreen.tick(dt);
    mainCanvasCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    practiceScreen.render(mainCanvas);
    prev = now;
    // console.log(1.0 / (dt == 0 ? 0.0000001 : dt));
    stats.end();
    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);