import {MatrixBlock} from "../matrix/matrixBlock";
import {Position} from "../position";
import {Collection, List, Map, Record} from "immutable";
import {PieceBlock} from "./pieceBlock";
import {PiecePrototype} from "./piecePrototype";
import {Transition} from "./transition";
import Indexed = Collection.Indexed;

interface PieceParams {
    piecePrototype?: PiecePrototype;
    orientationId?: number;
    position?: Position;
}

export class Piece extends Record({
    piecePrototype: new PiecePrototype(List(), Map(), Map()),
    orientationId: 0,
    position: new Position()
}) {
    readonly piecePrototype!: PiecePrototype;
    readonly orientationId!: number;
    readonly position!: Position;

    constructor(params?: PieceParams) {
        params? super(params) : super();
    }

    /**
     * Get list of Piece-relative blocks represented by this piece.
     *
     * @returns An Indexed of all PieceBlocks represented by this piece.
     */
    // TODO: Cache this? It won't change per piece since pieces are immutable. Downside is redundant obj.
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
    // TODO: Cache this? It won't change per piece since pieces are immutable. Downside is redundant obj.
    getMatrixBlocks(): Indexed<MatrixBlock> {
        return this.getBlocks().map(pieceBlock => MatrixBlock.fromPieceBlock(pieceBlock, this));
    }

    /**
     * Translate this piece by the given position.
     *
     * @param dPos - Delta position to use for the translation.
     * @param isPieceValidPredicate - A predicate function on a Piece which returns true iff the piece is valid.
     * @returns A new Piece which is this piece translated by dPos if valid or this piece if the translation wasn't valid.
     */
    maybeTranslated(dPos: Position, isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        const newPiece: Piece = this.merge({position: this.position.translated(dPos)});
        return isPieceValidPredicate(newPiece) ? newPiece : this;
    }

    /**
     * Try to transition this piece to a new obj.
     *
     * Tries to apply each transition in sequence and returns the first valid resulting piece.
     *
     * @param transitions - Iterable of transitions to try in order.
     * @param isPieceValidPredicate - A predicate function on a Piece which returns true iff the piece is valid.
     * @returns A new Piece which is the first valid resulting piece of applying each transition to this Piece or this Piece if no transition produced a valid piece. Note even if the first successful transition is a no-op a new Piece will be returned.
     */
    maybeTransitioned(transitions: Iterable<Transition>, isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        for (const transition of transitions) {
            const newPiece = this.merge({
                orientationId: transition.newOrientationId,
                position: this.position.translated(transition.offset)
            });
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
    maybeRotatedCw(isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        return this.maybeTransitioned(this.piecePrototype.getCwTransitions(this.orientationId), isPieceValidPredicate);
    }

    /**
     * Try to rotate this piece counter-clockwise.
     *
     * @param isPieceValidPredicate - A predicate function on a Piece which returns true iff the piece is valid.
     * @returns A new Piece which is the counter-clockwise rotation of this piece or this Piece if rotation failed.
     */
    maybeRotatedCcw(isPieceValidPredicate: (piece: Piece) => boolean): Piece {
        return this.maybeTransitioned(this.piecePrototype.getCcwTransitions(this.orientationId), isPieceValidPredicate);
    }
}