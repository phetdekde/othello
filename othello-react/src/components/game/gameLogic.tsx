import { IPlayMatrix } from './index';
import gameContext from '../../gameContext';
import React, { useContext } from 'react'
import socketService from '../../services/socketService';
import gameService from '../../services/gameService';
import { Game }from './index'

class GameLogic {
    public hello(color: number) {
        console.log('hello ' + color)
    }
}

export default new GameLogic();
