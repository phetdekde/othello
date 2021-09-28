import { IPlayMatrix } from './index';
import gameContext from '../../gameContext';
import React, { useContext } from 'react'
import socketService from '../../services/socketService';
import gameService from '../../services/gameService';

export class GameLogic {

    private matrix: Array<Array<number>> = [];
    private blackPos: Array<Array<number>> = [];
    private whitePos: Array<Array<number>> = [];

    constructor(matrix: Array<Array<number>>) {
        this.matrix = matrix;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(this.matrix[row][col] === 1) this.blackPos.push([row, col]);
                if(this.matrix[row][col] === 2) this.whitePos.push([row, col]);
            }
        }
    }

    public getBoard() {
        return this.matrix;
    }

    public getPos(color: number) {
        // return Array<Array<number>> of black(1) or white(2)
        // ex. [[1, 2], [3, 4], [row, col], ...]
        return color === 1 ? this.blackPos : this.whitePos;
    }

    public getScore(color: number) {
        return color === 1 ? this.blackPos.length : this.whitePos.length;
    }

    public canClickSpot(row: number, col: number, color: number) {
        /*
            if that spot is not empty 
                return
            if that spot can't flip other disks
                return false
            else 
                return true
        */
       if(this.matrix[row][col] !== 0) return false;
       var affectedDisks = this.getAffectedDisks(row, col, color);
       if(affectedDisks.length === 0) 
            return false;
       else 
            return true;
    }

    private iterator(row: number, rd: number, col: number, cd: number, color: number, affectedDisks: object[]) {
        /*
            This function will keep iterating to one direction and return all spots that will get flipped

            WHILE LOOP (until it hits the board border)
                if it found an empty spot
                    if it found its own color
                        concat couldBeAffected to affectedDisks
                    break
                else
                    add that spot to couldBeAffected list
            return affectDisks
        */
        var couldBeAffected:object[] = [];

        var columnIterator = col, rowIterator = row;
        while(
            ((rowIterator    < 7 && rd === 1) || (rowIterator    > 0 && !(rd === 1)))
                                            &&
            ((columnIterator < 7 && cd === 1) || (columnIterator > 0 && !(cd === 1)))           
        ) {
            columnIterator += cd;
            rowIterator += rd;
            var valueAtSpot = this.matrix[rowIterator][columnIterator];

            if (valueAtSpot === 0 || valueAtSpot === color) {
                if (valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = { row: rowIterator, col: columnIterator }
                couldBeAffected.push(diskLocation);
            }
        }

        return affectedDisks;
    }

    public getAffectedDisks(row: number, col: number, color: number) {
        var affectedDisks:object[] = [];

        /*
            rd and cd can tell which direction we want to check
                rd: 1 = up to down    | -1 = down to up
                cd: 1 = left to right | -1 = right to left
                    0 = we don't want to iterate through that direction
        */

        //check from left to right (rd=0 cd=1) 
        affectedDisks = this.iterator(row, 0, col, 1, color, affectedDisks);

        //right to left (rd=0 cd=-1)
        affectedDisks = this.iterator(row, 0, col, -1, color, affectedDisks);

        //down to up (rd=-1 cd=0)
        affectedDisks = this.iterator(row, -1, col, 0, color, affectedDisks);

        //up to down (rd=1 cd=0)
        affectedDisks = this.iterator(row, 1, col, 0, color, affectedDisks);

        //down right (rd=1 cd=1)
        affectedDisks = this.iterator(row, 1, col, 1, color, affectedDisks);

        //down left (rd=1 cd=-1)
        affectedDisks = this.iterator(row, 1, col, -1, color, affectedDisks);

        //up left (rd=-1 cd=-1)
        affectedDisks = this.iterator(row, -1, col, -1, color, affectedDisks);

        //up right (rd=-1 cd=1)
        affectedDisks = this.iterator(row, -1, col, 1, color, affectedDisks);

        return affectedDisks;
    }

    private flipDisks(affectedDisks: Array<any>) {
        /*
            FOR all items in affectDisks
                if the disk at that spot has value equals to 1
                    make it 2
                else
                    make it 2
        */
       affectedDisks.forEach(e => {
        this.matrix[e.row][e.col] === 1 ? this.matrix[e.row][e.col] = 2 : this.matrix[e.row][e.col] = 1;
        });
    }

    public canThisPlayerMove(color: number) {
        //LOOP through the whole board to find ATLEAST 1 spot that can be placed
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(this.canClickSpot(row, col, color)) {
                    return true;
                }
            }
        }
        return false;
    }

    public getMovableCell(color: number) {
        //return every spots that can be placed
        var movable = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(this.canClickSpot(row, col, color)) movable.push([row, col]);
            }
        }
        return movable;
    }

    public isTerminal() {
        return this.blackPos.length === 0 || this.whitePos.length === 0 || this.blackPos.length + this.whitePos.length === 64;
    }

    public move(row: number, col: number, color: number) {
        if(this.matrix[row][col] !== 0) return this;
        var captured = this.getAffectedDisks(row, col, color);
        if(captured.length !== 0) {
            this.flipDisks(captured);
            this.matrix[row][col] = color;
        }
        return this;
    }
}

