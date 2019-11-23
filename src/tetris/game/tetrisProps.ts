export class TetrisProps {
    readonly gravityRate: number;
    readonly lockDelay: number;
    readonly pieceClearDelay: number;

    constructor(gravityRate: number, lockDelay: number, pieceClearDelay: number) {
        this.gravityRate = gravityRate;
        this.lockDelay = lockDelay;
        this.pieceClearDelay = pieceClearDelay;
    }
}