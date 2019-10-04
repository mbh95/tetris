import {Piece} from "./piece";
import {Matrix} from "./matrix";
import {Position} from "./position";
import {List} from "immutable";

export const DIR_UP = new Position({row: 1, col: 0});
export const DIR_DOWN = new Position({row: -1, col: 0});
export const DIR_LEFT = new Position({row: 0, col: -1});
export const DIR_RIGHT = new Position({row: 0, col: 1});

export const ALL_DIRECTIONS: List<Position> = List([DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT]);

export function isPieceOnGround(piece: Piece, matrix: Matrix): boolean {
    return matrix.isPieceValid(piece) && !matrix.isPieceValid(piece.translated(new Position({row: -1, col: 0})));
}

// TODO: Binary search for ghost piece?
export function getGhostPiece(piece: Piece, matrix: Matrix): Piece {
    let curGhost = piece;
    let candidate = piece.translated(DIR_DOWN);
    while (matrix.isPieceValid(candidate)) {
        curGhost = candidate;
        candidate = curGhost.translated(DIR_DOWN);
    }
    return curGhost;
}

export function canPieceMove(piece: Piece, matrix: Matrix): boolean {
    return !ALL_DIRECTIONS
        .filter(dir => matrix.isPieceValid(piece.translated(dir))) // Get all directions piece can move.
        .isEmpty(); // If list is empty then piece can't move, so negate to find if it can.
}

export function isAllClear(matrix: Matrix): boolean {
    return matrix.blocks.isEmpty();
}