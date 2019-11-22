import {Block} from "../obj/block";
import {PiecePrototype} from "../obj/piece/piecePrototype";
import * as PieceUtils from "../util/pieceUtils";
import {List} from "immutable";
import BlockTable = PieceUtils.BlockTable;
import KickTable = PieceUtils.KickTable;

const I_BLOCK_TABLE: BlockTable = [[0, -1], [0, 0], [0, 1], [0, 2]];
const J_BLOCK_TABLE: BlockTable = [[1, -1], [0, -1], [0, 0], [0, 1]];
const L_BLOCK_TABLE: BlockTable = [[1, 1], [0, -1], [0, 0], [0, 1]];
const O_BLOCK_TABLE: BlockTable = [[1, 0], [1, 1], [0, 0], [0, 1]];
const S_BLOCK_TABLE: BlockTable = [[1, 0], [1, 1], [0, -1], [0, 0]];
const T_BLOCK_TABLE: BlockTable = [[1, 0], [0, -1], [0, 0], [0, 1]];
const Z_BLOCK_TABLE: BlockTable = [[1, -1], [1, 0], [0, 0], [0, 1]];

const O_KICK_OFFSET_TABLE: KickTable = [
    [[0, 0]], // INITIAL
    [[-1, 0]], // RIGHT
    [[-1, -1]], // 2 ROTATIONS
    [[0, -1]]  // LEFT
];

const I_KICK_OFFSET_TABLE: KickTable = [
    [[0, 0], [0, -1], [0, 2], [0, -1], [0, 2]], // INITIAL
    [[0, -1], [0, 0], [0, 0], [1, 0], [-2, 0]], // RIGHT
    [[1, -1], [1, 1], [1, -2], [0, 1], [0, -2]], // 2 ROTATIONS
    [[1, 0], [1, 0], [1, 0], [-1, 0], [2, 0]]  // LEFT
];

const J_L_S_T_Z_KICK_OFFSET_TABLE: KickTable = [
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], // INITIAL
    [[0, 0], [0, 1], [-1, 1], [2, 0], [2, 1]], // RIGHT
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], // 2 ROTATIONS
    [[0, 0], [0, -1], [-1, -1], [2, 0], [2, -1]]  // LEFT
];

const DEFAULT_KICK_OFFSET_TABLE: KickTable = [
    [[0, 0]], // INITIAL
    [[0, 0]], // RIGHT
    [[0, 0]], // 2 ROTATIONS
    [[0, 0]], // LEFT
];

const BLOCK_I = new Block(1);
const BLOCK_J = new Block(2);
const BLOCK_L = new Block(3);
const BLOCK_O = new Block(4);
const BLOCK_S = new Block(5);
const BLOCK_T = new Block(6);
const BLOCK_Z = new Block(7);

export const SRS_I: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(I_BLOCK_TABLE, BLOCK_I),
    PieceUtils.cwTransitionsFromKickTable(I_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(I_KICK_OFFSET_TABLE)
);
export const SRS_J: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(J_BLOCK_TABLE, BLOCK_J),
    PieceUtils.cwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE)
);
export const SRS_L: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(L_BLOCK_TABLE, BLOCK_L),
    PieceUtils.cwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE)
);
export const SRS_O: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(O_BLOCK_TABLE, BLOCK_O),
    PieceUtils.cwTransitionsFromKickTable(O_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(O_KICK_OFFSET_TABLE)
);
export const SRS_S: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(S_BLOCK_TABLE, BLOCK_S),
    PieceUtils.cwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE)
);

export const SRS_T: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(T_BLOCK_TABLE, BLOCK_T),
    PieceUtils.cwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE)
);
export const SRS_Z: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(Z_BLOCK_TABLE, BLOCK_Z),
    PieceUtils.cwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(J_L_S_T_Z_KICK_OFFSET_TABLE)
);

export const ALL_SRS_TETROMINOES: List<PiecePrototype> = List([SRS_I, SRS_J, SRS_L, SRS_O, SRS_S, SRS_T, SRS_Z]);

export const NES_I: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(I_BLOCK_TABLE, BLOCK_I),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);
export const NES_J: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(J_BLOCK_TABLE, BLOCK_J),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);
export const NES_L: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(L_BLOCK_TABLE, BLOCK_L),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);
export const NES_O: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(O_BLOCK_TABLE, BLOCK_O),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);
export const NES_S: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(S_BLOCK_TABLE, BLOCK_S),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);

export const NES_T: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(T_BLOCK_TABLE, BLOCK_T),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);
export const NES_Z: PiecePrototype = new PiecePrototype(
    PieceUtils.orientationsFromBlocks(Z_BLOCK_TABLE, BLOCK_Z),
    PieceUtils.cwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE),
    PieceUtils.ccwTransitionsFromKickTable(DEFAULT_KICK_OFFSET_TABLE)
);

export const ALL_NES_TETROMINOES: List<PiecePrototype> = List([NES_I, NES_J, NES_L, NES_O, NES_S, NES_T, NES_Z]);