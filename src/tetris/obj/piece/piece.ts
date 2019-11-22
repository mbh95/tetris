import {MatrixBlock} from "../matrix/matrixBlock";
import {Position} from "../position";
import {Collection} from "immutable";
import {PieceBlock} from "./pieceBlock";
import {PiecePrototype} from "./piecePrototype";
import {Transition} from "./transition";
import Indexed = Collection.Indexed;

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
     * Try to transition this piece to a new obj.
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