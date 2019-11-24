import {BlockColor} from "../tetris/data/blockColor";
import {Block} from "../tetris/state/block";

export interface BlockRenderer {
    drawBlock(ctx: CanvasRenderingContext2D, block: Block, x: number, y: number, blockSize: number): void;
}

export class SimpleBlockRenderer implements BlockRenderer {
    getFillStyle(color: BlockColor): string {
        switch (color) {
            case BlockColor.UNKNOWN:
                return "fuchsia";
            case BlockColor.I_CYAN:
                return "cyan";
            case BlockColor.J_BLUE:
                return "blue";
            case BlockColor.L_ORANGE:
                return "orange";
            case BlockColor.O_YELLOW:
                // return "yellow";
                return "gold";
            case BlockColor.S_GREEN:
                return "green";
            case BlockColor.T_PURPLE:
                return "purple";
            case BlockColor.Z_RED:
                return "red";
        }
    }

    drawBlock(ctx: CanvasRenderingContext2D, block: Block, x: number, y: number, blockSize: number): void {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, blockSize, blockSize);
        ctx.fillStyle = this.getFillStyle(block.color);
        ctx.strokeStyle = "black";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

}