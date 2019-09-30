import {TetrisActionEvent, TetrisActionEventType} from "../events/actionEvent";
import {TetrisInputEvent, TetrisInputEventType} from "../events/inputEvent";
import {Dispatcher} from "../util/dispatcher";
import {Joystick2, RepeaterButton, ToggleButton} from "./virtualButtons";

/**
 * Consumes TetrisInputEvents
 * Produces TetrisActionEvents
 *
 * TetrisActionEvents are not buffered and there is no guarantee when they will be generated. Some might be generated during
 * update() and some might be generated immediately when handling a TetrisInputEvent.
 */
export class VirtualGamepad {
    private readonly actionDispatcher: Dispatcher<TetrisActionEvent>;
    readonly inputHandler: (e: TetrisInputEvent) => void;

    private buttonMoveLR: Joystick2;
    private buttonSoftDrop: RepeaterButton;
    private buttonHardDrop: ToggleButton;
    private buttonRotateCCW: ToggleButton;
    private buttonRotateCW: ToggleButton;
    private buttonHold: ToggleButton;

    /**
     * VirtualGamepad constructor.
     * @param keyRepeatDelay - Number of seconds before key repeat kicks in.
     * @param keyRepeatRate - Number of times key repeats per second.
     */
    constructor(keyRepeatDelay: number, keyRepeatRate: number) {
        this.actionDispatcher = new Dispatcher<TetrisActionEvent>();
        this.inputHandler = (e: TetrisInputEvent): void => this.handleInputEvent(e);

        this.buttonSoftDrop = new RepeaterButton(keyRepeatDelay, keyRepeatRate,
            (): void => this.actionDispatcher.dispatch(
                {type: TetrisActionEventType.SOFT_DROP}));

        this.buttonHardDrop = new ToggleButton(
            (): void => this.actionDispatcher.dispatch(
                {type: TetrisActionEventType.HARD_DROP}));

        this.buttonMoveLR = new Joystick2(
            new RepeaterButton(keyRepeatDelay, keyRepeatRate,
                (): void => this.actionDispatcher.dispatch(
                    {type: TetrisActionEventType.MOVE_L})),
            new RepeaterButton(keyRepeatDelay, keyRepeatRate,
                (): void => this.actionDispatcher.dispatch(
                    {type: TetrisActionEventType.MOVE_R}))
        );

        this.buttonRotateCW = new ToggleButton(
            (): void => this.actionDispatcher.dispatch(
                {type: TetrisActionEventType.ROTATE_CW}));

        this.buttonRotateCCW = new ToggleButton(
            (): void => this.actionDispatcher.dispatch(
                {type: TetrisActionEventType.ROTATE_CCW}));

        this.buttonHold = new ToggleButton(
            (): void => this.actionDispatcher.dispatch(
                {type: TetrisActionEventType.HOLD}));
    }

    update(dt: number): void {
        this.buttonMoveLR.update(dt);
        this.buttonSoftDrop.update(dt);
        this.buttonHardDrop.update(dt);
        this.buttonRotateCW.update(dt);
        this.buttonRotateCCW.update(dt);
        this.buttonHold.update(dt);
    }

    handleInputEvent(e: TetrisInputEvent): void {
        switch (e.type) {
            case TetrisInputEventType.MOVE_L:
                e.keyDown ? this.buttonMoveLR.down1() : this.buttonMoveLR.up1();
                break;
            case TetrisInputEventType.MOVE_R:
                e.keyDown ? this.buttonMoveLR.down2() : this.buttonMoveLR.up2();
                break;
            case TetrisInputEventType.ROTATE_CW:
                e.keyDown ? this.buttonRotateCW.downEvent() : this.buttonRotateCW.upEvent();
                break;
            case TetrisInputEventType.ROTATE_CCW:
                e.keyDown ? this.buttonRotateCCW.downEvent() : this.buttonRotateCCW.upEvent();
                break;
            case TetrisInputEventType.SOFT_DROP:
                e.keyDown ? this.buttonSoftDrop.downEvent() : this.buttonSoftDrop.upEvent();
                break;
            case TetrisInputEventType.HARD_DROP:
                e.keyDown ? this.buttonHardDrop.downEvent() : this.buttonHardDrop.upEvent();
                break;
            case TetrisInputEventType.HOLD:
                e.keyDown ? this.buttonHold.downEvent() : this.buttonHold.upEvent();
                break;
        }
    }

    registerActionHandler(callback: (e: TetrisActionEvent) => void): void {
        this.actionDispatcher.registerCallback(callback);
    }
}