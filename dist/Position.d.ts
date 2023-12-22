export class Position {
    /**
     * @param pos {number}
     * @param row {number}
     * @param col {number}
     */
    constructor(pos: number, row: number, col: number);
    /** @readonly */
    readonly pos: number;
    /** @readonly */
    readonly row: number;
    /** @readonly */
    readonly col: number;
}
