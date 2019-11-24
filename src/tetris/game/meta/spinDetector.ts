import {TetrisStateTransitionEvent} from "../../../events/transitionEvent";
import {
    isPieceChangeTransition,
    TransitionType,
    TransitionData,
    isPieceLockTransition,
    isRotationTransition
} from "../../state/transition";
import {canPieceMove} from "../../util/tetrisUtils";

export class SpinDetector {

    private lastPieceChangeTransitionType: TransitionType | undefined;

    readonly transitionHandler: (e: TetrisStateTransitionEvent) => void;

    constructor() {
        this.transitionHandler = (e: TetrisStateTransitionEvent) => this.handleTransitionEvent(e);
    }

    handleTransitionEvent(e: TetrisStateTransitionEvent): void {
        e.nextState.transitionData.forEach((transition: TransitionData) => {
            this.lastPieceChangeTransitionType = isPieceChangeTransition(transition.type) ? transition.type : this.lastPieceChangeTransitionType;
            if (isPieceLockTransition(transition.type)) {
                console.log(this.lastPieceChangeTransitionType);
                if (this.lastPieceChangeTransitionType !== undefined && isRotationTransition(this.lastPieceChangeTransitionType)) {
                    console.log("ROTATE->LOCK");
                    if (transition.lockData !== undefined) {
                        if (!canPieceMove(transition.lockData.lockedPiece, transition.lockData.prevMatrix)) {
                            console.log("SPIN!!!!!!!");
                        }
                    }
                }
            }
        });
    }
}