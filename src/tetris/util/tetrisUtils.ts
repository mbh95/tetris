import {Piece} from "../state/piece/piece";
import {Matrix} from "../state/matrix/matrix";
import {PiecePrototype} from "../state/piece/piecePrototype";
import {Position} from "../state/position";
import {List} from "immutable";

export const DIR_UP = new Position({row: 1, col: 0});
export const DIR_DOWN = new Position({row: -1, col: 0});
export const DIR_LEFT = new Position({row: 0, col: -1});
export const DIR_RIGHT = new Position({row: 0, col: 1});

export const ALL_DIRECTIONS: List<Position> = List([DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT]);

export function isPieceOnGround(piece: Piece, matrix: Matrix): boolean {
    // A piece is on the ground iff it is valid and trying to translate it downward does nothing.
    return matrix.isPieceValid(piece) && (piece.maybeTranslated(DIR_DOWN, piece => matrix.isPieceValid(piece)) === piece);
}

export function getGhostPiece(piece: Piece, matrix: Matrix): Piece {
    let curGhost;
    let candidate = piece;
    do {
        curGhost = candidate;
        candidate = curGhost.maybeTranslated(DIR_DOWN, piece => matrix.isPieceValid(piece));
    } while (candidate !== curGhost);
    return curGhost;
}

export function canPieceMove(piece: Piece, matrix: Matrix): boolean {
    return !ALL_DIRECTIONS
        .map(dir => piece.maybeTranslated(dir, piece => matrix.isPieceValid(piece)))
        .filter(maybeTranslated => maybeTranslated !== piece) // Get all directions piece can move in
        .isEmpty(); // If list is empty then piece can't move, so negate to find if it can.
}

export function isAllClear(matrix: Matrix): boolean {
    return matrix.blocks.isEmpty();
}

export function getSpawnedPiece(piecePrototype: PiecePrototype, matrix: Matrix): Piece {
    return new Piece({
        piecePrototype,
        orientationId: 0,
        position: matrix.spawnPos
    });
}