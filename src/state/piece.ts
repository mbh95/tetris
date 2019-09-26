import {Position} from "./position";
import {Block, MatrixBlock, PieceBlock} from "./block";
import {Collection, List, Map} from "immutable";
import Indexed = Collection.Indexed;

export class Orientation {
    readonly blocks: Map<Position, Block>;

    constructor(blocks: Map<Position, Block>) {
        this.blocks = blocks;
    }
}

// TODO: Explore generalizing transitions to functions which map Piece->Piece
export class Transition {
    readonly newOrientationId: number;
    readonly offset: Position;

    constructor(newOrientationId: number, offset: Position) {
        this.newOrientationId = newOrientationId;
        this.offset = offset;
    }
}

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

export class Piece {
    readonly piecePrototype: PiecePrototype;
    readonly orientationId: number;
    readonly position: Position;

    constructor(piecePrototype: PiecePrototype, orientationId: number, position: Position) {
        this.piecePrototype = piecePrototype;
        this.orientationId = orientationId;
        this.position = position;
    }

    /**
     * Translate this piece by the given position.
     *
     * @param dPos - Delta position to use for the translation.
     * @returns A new Piece which is this piece translated by dPos. Note that even if dPos=(0,0) a new Piece will be returned.
     */
    translated(dPos: Position): Piece {
        return new Piece(this.piecePrototype, this.orientationId, this.position.translated(dPos));
    }

    /**
     * Get list of Piece-relative blocks represented by this piece.
     *
     * @returns An Indexed of all PieceBlocks represented by this piece.
     */
    // TODO: Cache this? It won't change per piece since pieces are immutable. Downside is redundant state.
    getBlocks(): Indexed<PieceBlock> {
        return this.piecePrototype.getOrientation(this.orientationId).blocks
            .entrySeq()
            .map(posBlockPair => new PieceBlock(posBlockPair[1], posBlockPair[0]));
    }

    /**
     * Get all Matrix-relative blocks represented by this Piece.
     *
     * @returns An Indexed of all MatrixBlocks represented by this piece.
     */
    // TODO: Cache this? It won't change per piece since pieces are immutable. Downside is redundant state.
    getMatrixBlocks(): Indexed<MatrixBlock> {
        return this.getBlocks().map(pieceBlock => MatrixBlock.fromPieceBlock(pieceBlock, this));
    }

    /**
     * Try to transition this piece to a new state.
     *
     * Tries to apply each transition in sequence and returns the first valid resulting piece.
     *
     * @param transitions - Iterable of transitions to try in order.
     * @param isPieceValidPredicate - A predicate function on a Piece which returns true iff the piece is valid.
     * @returns A new Piece which is the first valid resulting piece of applying each transition to this Piece or this Piece if no transition produced a valid piece. Note even if the first successful transition is a no-op a new Piece will be returned.
     */
    transitioned(transitions: Iterable<Transition>, isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        for (const transition of transitions) {
            const newPiece = new Piece(this.piecePrototype, transition.newOrientationId, this.position.translated(transition.offset));
            if (isPieceValidPredicate(newPiece)) {
                return newPiece;
            }
        }
        return this;
    }

    /**
     * Try to rotate this piece clockwise.
     *
     * @param isPieceValidPredicate - A predicate function on a Piece which returns true iff the piece is valid.
     * @returns A new Piece which is the clockwise rotation of this piece or this Piece if rotation failed.
     */
    rotatedCw(isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        return this.transitioned(this.piecePrototype.getCwTransitions(this.orientationId), isPieceValidPredicate);
    }

    /**
     * Try to rotate this piece counter-clockwise.
     *
     * @param isPieceValidPredicate - A predicate function on a Piece which returns true iff the piece is valid.
     * @returns A new Piece which is the counter-clockwise rotation of this piece or this Piece if rotation failed.
     */
    rotatedCcw(isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        return this.transitioned(this.piecePrototype.getCcwTransitions(this.orientationId), isPieceValidPredicate);
    }
}