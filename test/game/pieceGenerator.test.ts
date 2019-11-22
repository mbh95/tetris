
import {List, Map, Set} from "immutable";
import {PiecePrototype} from "../../src/tetris/obj/piece/piecePrototype";
import {BagGenerator, Generator} from "../../src/util/generator";
import {ALL_SRS_TETROMINOES, SRS_I, SRS_J, SRS_L, SRS_O, SRS_S, SRS_T, SRS_Z} from "../../src/tetris/data/tetromino";
import {Random} from "../../src/util/random";

const descriptionMap: Map<PiecePrototype, string> =
    Map([
        [SRS_I, "I"],
        [SRS_J, "J"],
        [SRS_L, "L"],
        [SRS_O, "O"],
        [SRS_S, "S"],
        [SRS_T, "T"],
        [SRS_Z, "Z"]
    ]);

test("Test bag generator", ()=>{
    let q: Generator<PiecePrototype> = BagGenerator.newBagGenerator<PiecePrototype>(List(ALL_SRS_TETROMINOES), new Random(123n));
    let hist: string[] = [];
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 7; j++) {
            hist.push(descriptionMap.get(q.get())!);
            q = q.next();
        }
        const unused = Set(descriptionMap.values()).filter(v => hist.indexOf(v) < 0);
        expect(unused.size).toBe(0);
        hist = [];
    }
});
