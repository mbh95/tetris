import {Position} from "../../src/tetris/obj/position";

test("Merge works as expected", ()=>{
    const p1: Position = new Position({row: 123, col: 456});
    const p2: Position = p1.merge({row: 789});
    const p3: Position = p2.merge({row: 321, col: 654});

    expect(p1.row).toBe(123);
    expect(p1.col).toBe(456);

    expect(p2.row).toBe(789);
    expect(p2.col).toBe(456);

    expect(p3.row).toBe(321);
    expect(p3.col).toBe(654);
});

