export class TetrisProps {
    readonly gravityRate: number;
    readonly lockDelay: number;

    constructor(gravityRate: number, lockDelay: number) {
        this.gravityRate = gravityRate;
        this.lockDelay = lockDelay;
    }
}