import {
    isPieceChangeTransition,
    TransitionType,
    StateTransition,
    isPieceLockTransition,
    isRotationTransition
} from "../../state/transition";
import {canPieceMove} from "../../util/tetrisUtils";

export class SpinDetector {

    private lastPieceChangeTransitionType: TransitionType | undefined;

    readonly transitionHandler: (e: StateTransition) => void;

    constructor() {
        this.transitionHandler = (e: StateTransition) => this.handleTransitionEvent(e);
    }

    handleTransitionEvent(e: StateTransition): void {

        this.lastPieceChangeTransitionType = isPieceChangeTransition(e.transitionData.transitionType) ? e.transitionData.transitionType : this.lastPieceChangeTransitionType;
        if (isPieceLockTransition(e.transitionData.transitionType)) {
            console.log(this.lastPieceChangeTransitionType);
            if (this.lastPieceChangeTransitionType !== undefined && isRotationTransition(this.lastPieceChangeTransitionType)) {
                console.log("ROTATE->LOCK");
                if (e.transitionData.lockData !== undefined) {
                    if (!canPieceMove(e.transitionData.lockData.lockedPiece, e.transitionData.lockData.prevMatrix)) {
                        console.log("SPIN!!!!!!!");
                    }
                }
            }
        }
    }
}