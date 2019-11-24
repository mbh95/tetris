import {Position} from "../../src/tetris/state/position";

test("Merge works as expected", ()=>{
    const p1: Position = new Position({row: 1, col: 10});
    const p2: Position = p1.merge({row: 2});
    const p3: Position = p1.merge({col: 30});
    const p4: Position = p1.merge({row: 4, col: 40});

    expect(p1.row).toBe(1);
    expect(p1.col).toBe(10);

    expect(p2.row).toBe(2);
    expect(p2.col).toBe(10);

    expect(p3.row).toBe(1);
    expect(p3.col).toBe(30);

    expect(p4.row).toBe(4);
    expect(p4.col).toBe(40);
});

test("Merge doesn't copy unnecessarily", ()=>{
    const p1: Position = new Position({row: 123, col: 456});
    const p2: Position = new Position({row: 123, col: 456});
    const p3: Position = p1.merge({row: 123, col: 456});

    expect(p1 === p2).toBeFalsy();
    expect(p1 === p3).toBeTruthy();
});

