export interface VirtualButton {
    downEvent(): void;

    upEvent(): void;

    update(dt: number): void;
}

export class ToggleButton implements VirtualButton {
    private readonly action: () => void;
    private pressed: boolean;

    constructor(action: () => void) {
        this.action = action;
        this.pressed = false;
    }

    upEvent(): void {
        this.pressed = false;
    }

    downEvent(): void {
        if (!this.pressed) {
            this.pressed = true;
            this.action();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    update(dt: number): void {
        return;
    }
}

export class RepeaterButton implements VirtualButton {
    readonly repeatDelay: number;
    readonly repeatRate: number;

    private pressed: boolean;
    private repeatDelayCountdown: number;
    private repeatCounter: number;
    private readonly action: () => void;

    constructor(repeatDelay: number, repeatRate: number, action: () => void) {
        this.repeatDelay = repeatDelay;
        this.repeatRate = repeatRate;

        this.action = action;
        this.pressed = false;
        this.repeatDelayCountdown = repeatDelay;
        this.repeatCounter = 0;
    }

    downEvent(): void {
        if (this.pressed) {
            return;
        }
        this.pressed = true;
        this.repeatCounter = 1.0;
    }

    upEvent(): void {
        this.pressed = false;
        this.repeatDelayCountdown = this.repeatDelay;
        this.repeatCounter = 0;
    }

    update(dt: number): void {
        if (this.pressed) {
            if (this.repeatDelayCountdown > 0) {
                this.repeatDelayCountdown -= dt;
                if (this.repeatDelayCountdown < 0) {
                    this.repeatDelayCountdown = 0;
                }
            }
            if (this.repeatDelayCountdown <= 0) {
                this.repeatCounter += (dt * this.repeatRate);
            }
        }
        while (this.repeatCounter >= 1.0) {
            this.action();
            this.repeatCounter -= 1.0;
        }
    }

}

export class Joystick2 {
    private readonly button1: VirtualButton;
    private readonly button2: VirtualButton;

    constructor(button1: VirtualButton, button2: VirtualButton) {
        this.button1 = button1;
        this.button2 = button2;
    }

    down1(): void {
        this.button1.downEvent();
        this.button2.upEvent();
    }

    down2(): void {
        this.button2.downEvent();
        this.button1.upEvent();
    }

    up1(): void {
        this.button1.upEvent();
    }

    up2(): void {
        this.button2.upEvent();
    }

    update(dt: number): void {
        this.button1.update(dt);
        this.button2.update(dt);
    }
}