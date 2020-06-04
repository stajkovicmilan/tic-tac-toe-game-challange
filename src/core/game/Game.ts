import { injectable, inject } from "inversify";
import { v4 as createUUID } from 'uuid';

import { Types } from "../dependency-injection";
import { IDB } from "../db/IDB";
import { UserModel } from "../../models/UserModel";
import { IGame } from "./IGame";
import { GameModel, GameType, GameStatus, GameWinner } from "../../models/GameModel";

@injectable()
export class Game implements IGame {

    private winningMoves: number[][] = [
        [1, 2, 3], [4, 5.6], [7, 8, 9],
        [1, 4, 7], [2, 5, 8], [3, 6, 9],
        [1, 5, 9], [7, 5, 3]
    ];

    private allMoves: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    constructor(@inject(Types.IDB) private db: IDB) { }

    public async createGame(user: UserModel, gameType: GameType): Promise<GameModel> {

        const activeGame: GameModel | undefined = await this.db.getUserActiveGame(user.id ? user.id : '');
        if (activeGame) {
            throw new Error('User already have active game!');
        }

        const newGame: GameModel = {
            id: createUUID(),
            type: gameType,
            status: GameStatus.ACTIVE,
            winner: GameWinner.UNKNOWN,
            firstPlayerId: user.id ? user.id : '',
            firstPlayerName: `${user.firstName} ${user.lastName}`,
            firstPlayerMoves: [],
            secondPlayerMoves: [],
            gameMoves: [],
            playerOnMoveId: gameType === GameType.SINGLE_PLAYER && user.id ? user.id : '',
        }

        return await this.db.addGame(newGame);

    }

    public async joinMultiPlayerGame(user: UserModel, gameId: string): Promise<GameModel> {

        const activeGame: GameModel | undefined = await this.db.getUserActiveGame(user.id ? user.id : '');
        if (activeGame) {
            throw new Error('User already have active game!');
        }

        const game: GameModel | undefined = await this.db.getGameById(gameId);
        if (!game) {
            throw new Error('Game not found!');
        }

        if (game.firstPlayerId === user.id ||
            !!game.secondPlayerId ||
            !!game.playerOnMoveId ||
            game.secondPlayerId === user.id ||
            game.status !== GameStatus.ACTIVE) {
            throw new Error('You can not join this game!');
        }

        game.secondPlayerId = user.id;
        game.secondPlayerName = `${user.firstName} ${user.lastName}`;
        game.playerOnMoveId = game.firstPlayerId;

        return await this.db.updateGame(game);

    }

    public async makeMoveInSinglePlayerGame(user: UserModel, gameId: string, move: number): Promise<GameModel> {

        const game: GameModel | undefined = await this.db.getGameById(gameId);
        if (!game) {
            throw new Error('Game not found!');
        }

        if (game.status !== GameStatus.ACTIVE) {
            throw new Error('You can not make move in this game!');
        }

        if (game.gameMoves.includes(move) || !this.allMoves.includes(move)) {
            throw new Error('Impossible move!');
        }

        game.firstPlayerMoves.push(move);
        game.gameMoves.push(move);

        let winningCombination = this.checkIfLastMoveIsWinnerMove(game.firstPlayerMoves);
        if (winningCombination && winningCombination.length) {
            game.winningCombination = winningCombination;
            game.winner = GameWinner.FIRST_PLAYER;
            game.status = GameStatus.INACTIVE;
            game.playerOnMoveId = '';
            return await this.db.updateGame(game);

        }

        const availableMoves: number[] = this.getAvailableMoves(game.gameMoves);
        if (!availableMoves.length && game.gameMoves.length === 9) {
            game.winner = GameWinner.DRAW_GAME;
            game.status = GameStatus.INACTIVE;
            game.playerOnMoveId = '';
            return await this.db.updateGame(game);
        }

        game.secondPlayerMoves.push(availableMoves[0]);
        game.gameMoves.push(availableMoves[0]);
        winningCombination = this.checkIfLastMoveIsWinnerMove(game.firstPlayerMoves);
        if (winningCombination && winningCombination.length) {
            game.winningCombination = winningCombination;
            game.winner = GameWinner.SECOND_PLAYER;
            game.status = GameStatus.INACTIVE;
            game.playerOnMoveId = '';
        }
        return await this.db.updateGame(game);
    }

    public async makeMoveInMultiPlayerGame(user: UserModel, gameId: string, move: number): Promise<GameModel> {
        const game: GameModel | undefined = await this.db.getGameById(gameId);
        if (!game) {
            throw new Error('Game not found!');
        }

        if (game.playerOnMoveId !== user.id ||
            game.status !== GameStatus.ACTIVE) {
            throw new Error('You can not make move in this game!');
        }

        if (game.gameMoves.includes(move) || !this.allMoves.includes(move)) {
            throw new Error('Impossible move!');
        }

        let winningCombination = null;
        game.gameMoves.push(move);
        const availableMoves: number[] = this.getAvailableMoves(game.gameMoves);

        if (game.firstPlayerId === user.id) {
            game.firstPlayerMoves.push(move);
            winningCombination = this.checkIfLastMoveIsWinnerMove(game.firstPlayerMoves);
            if (winningCombination && winningCombination.length) {
                game.winningCombination = winningCombination;
                game.winner = GameWinner.FIRST_PLAYER;
                game.status = GameStatus.INACTIVE;
            } else {
                game.playerOnMoveId = game.secondPlayerId ? game.secondPlayerId : '';
            }

        } else if (game.secondPlayerId === user.id) {
            game.secondPlayerMoves.push(move);
            winningCombination = this.checkIfLastMoveIsWinnerMove(game.secondPlayerMoves);
            if (winningCombination && winningCombination.length) {
                game.winningCombination = winningCombination;
                game.winner = GameWinner.SECOND_PLAYER;
                game.status = GameStatus.INACTIVE;
            } else {
                game.playerOnMoveId = game.firstPlayerId;
            }
        } else if (!availableMoves.length && game.gameMoves.length === 9) {
            game.winner = GameWinner.DRAW_GAME;
            game.status = GameStatus.INACTIVE;
            game.playerOnMoveId = '';
        }

        return await this.db.updateGame(game);
    }

    public async endGame(user: UserModel, gameId: string): Promise<GameModel> {
        const game: GameModel | undefined = await this.db.getGameById(gameId);
        if (!game) {
            throw new Error('Game not found!');
        }

        if (game.status === GameStatus.INACTIVE) {
            throw new Error('Game is already ended!');
        }

        if (game.firstPlayerId !== user.id || game.secondPlayerId !== user.id) {
            throw new Error('You are not authorized to end this game!');
        }
        game.status = GameStatus.INACTIVE;
        game.playerOnMoveId = '';
        return await this.db.updateGame(game);

    }

    private checkIfLastMoveIsWinnerMove(userMoves: number[]): number[] | null {
        let winningCombination = null;
        if (userMoves.length > 2) {
            for (let i = 0; i < this.winningMoves.length; i++) {
                if (this.winningMoves[i].every(e => userMoves.includes(e))) {
                    winningCombination = this.winningMoves[i];
                    break;
                }
            }
        }
        return winningCombination;
    }

    private getAvailableMoves(allMovesPlayed: number[]): number[] {
        return this.allMoves.filter(move => !allMovesPlayed.includes(move));
    }


}