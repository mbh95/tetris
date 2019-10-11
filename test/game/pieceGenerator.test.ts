
import {List, Map, Set} from "immutable";
import {PiecePrototype} from "../../src/game/piece";
import {BagPieceGenerator, PieceGenerator} from "../../src/game/pieceGenerator";
import {ALL_SRS_TEROMINOES, SRS_I, SRS_J, SRS_L, SRS_O, SRS_S, SRS_T, SRS_Z} from "../../src/game/tetromino";

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
    let q: PieceGenerator = BagPieceGenerator.newBagPieceGenerator(List(ALL_SRS_TEROMINOES));
    let hist: string[] = [];
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 7; j++) {
            hist.push(descriptionMap.get(q.head())!);
            q = q.tail();
        }
        const unused = Set(descriptionMap.values()).filter(v => hist.indexOf(v) < 0);
        expect(unused.size).toBe(0);
        hist = [];
    }
});
