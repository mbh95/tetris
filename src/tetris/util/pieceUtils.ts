import {List, Map, Range} from "immutable";
import {Block} from "../state/block";
import {Orientation} from "../state/piece/orientation";
import {Transition} from "../state/piece/transition";
import {Position} from "../state/position";

export type BlockTable = [number, number][];

/// Indices for offset tables are [STATE][ATTEMPT #][ROW (0) / COL (1)]
/// Rotating from obj A to obj B calculate the offset sequence by taking
/// (offset row, offset col) := (table[A][n][0] - table[B][n][0], table[A][n][1] - table[B][n][1])
/// where each n is attempted in order 0 ... N
export type KickTable = [number, number][][];

function rotate4Way(position: Position, index: number): Position {
    switch (index % 4) {
        case 0:
            return position;
        case 1:
            return new Position({row: -position.col, col: position.row});
        case 2:
            return new Position({row: -position.row, col: -position.col});
        case 3:
            return new Position({row: position.col, col: -position.row});
        default:
            return position;
    }
}

export function orientationsFromBlocks(blockArray: [number, number][], block: Block): List<Orientation> {
    const initialPositions: List<Position> = List(blockArray.map((pair) => new Position({
        row: pair[0],
        col: pair[1]
    })));
    return List(Range(0, 4).map(orientationId => new Orientation(Map(initialPositions
        .map(pos => rotate4Way(pos, orientationId))
        .map(newPos => [newPos, block])))));
}

export function transitionsFromKickTable(kickTable: KickTable, nextStateFn: (curState: number) => number): Map<number, List<Transition>> {
    const numStates = kickTable.length;

    const transitionsList: [number, List<Transition>][] = [];

    for (let state = 0; state < numStates; state++) {
        let nextStateRaw = nextStateFn(state);
        while (nextStateRaw < 0) {
            nextStateRaw += numStates;
        }

        const nextState = nextStateRaw % numStates;

        const ktStateCur = kickTable[state];
        const ktStateNext = kickTable[nextState];

        const minKtLen = Math.min(ktStateCur.length, ktStateNext.length);

        if (ktStateCur.length != ktStateNext.length) {
            console.warn(`Kick-table row lengths mismatched. Using ${minKtLen} = min(${ktStateCur.length}, ${ktStateNext.length})`)
        }

        const stateTransitions: Transition[] = [];
        for (let trial = 0; trial < minKtLen; trial++) {
            const rowOffset = kickTable[state][trial][0] - kickTable[nextState][trial][0];
            const colOffset = kickTable[state][trial][1] - kickTable[nextState][trial][1];
            const transition: Transition = new Transition(nextState, new Position({
                row: rowOffset,
                col: colOffset
            }));
            stateTransitions.push(transition);
        }
        transitionsList.push([state, List(stateTransitions)]);
    }
    return Map(transitionsList);
}

export function cwTransitionsFromKickTable(kickTable: KickTable): Map<number, List<Transition>> {
    return transitionsFromKickTable(kickTable, (state) => state + 1);
}

export function ccwTransitionsFromKickTable(kickTable: KickTable): Map<number, List<Transition>> {
    return transitionsFromKickTable(kickTable, (state) => state - 1);
}