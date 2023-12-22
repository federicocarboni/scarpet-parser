export class Position {
    /**
     * @param pos {number}
     * @param row {number}
     * @param col {number}
     */
    constructor(pos, row, col) {
        /** @readonly */
        this.pos = pos;
        /** @readonly */
        this.row = row;
        /** @readonly */
        this.col = col;
    }
}
