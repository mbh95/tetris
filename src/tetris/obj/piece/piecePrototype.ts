import {List, Map} from "immutable";
import {Orientation} from "./orientation";
import {Transition} from "./transition";

export class PiecePrototype {
    readonly orientations: List<Orientation>;
    readonly cwTransitions: Map<number, List<Transition>>;
    readonly ccwTransitions: Map<number, List<Transition>>;

    constructor(orientations: List<Orientation>, cwTransitions: Map<number, List<Transition>>, ccwTransitions: Map<number, List<Transition>>) {
        this.orientations = orientations;
        this.cwTransitions = cwTransitions;
        this.ccwTransitions = ccwTransitions;
    }

    static getTransitionsFromMap(orientationId: number, transitionMap: Map<number, List<Transition>>): List<Transition> {
        const transitions: List<Transition> | undefined = transitionMap.get(orientationId);
        if (!transitions) {
            throw new Error(`Failed to get transition list on prototype at orientation ${orientationId}`);
        }
        return transitions;
    }

    getOrientation(orientationId: number): Orientation {
        const orientation: Orientation | undefined = this.orientations.get(orientationId);
        if (!orientation) {
            throw new Error(`Failed to get orientation ${orientationId} on prototype with ${this.orientations.size} orientations`);
        }
        return orientation;
    }

    getCwTransitions(orientationId: number): List<Transition> {
        return PiecePrototype.getTransitionsFromMap(orientationId, this.cwTransitions);
    }

    getCcwTransitions(orientationId: number): List<Transition> {
        return PiecePrototype.getTransitionsFromMap(orientationId, this.ccwTransitions);
    }
}