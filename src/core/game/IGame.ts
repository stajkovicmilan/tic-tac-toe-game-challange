import { UserModel } from "../../models/UserModel";
import { GameModel, GameType } from "../../models/GameModel";

export interface IGame {

    createGame(user: UserModel, gameType: GameType): Promise<GameModel>;
    joinMultiPlayerGame(user: UserModel, gameId: string): Promise<GameModel>;
    makeMoveInSinglePlayerGame(user: UserModel, gameId: string, move: number): Promise<GameModel>;
    makeMoveInMultiPlayerGame(user: UserModel, gameId: string, move: number): Promise<GameModel>;
    endGame(user: UserModel, gameId: string): Promise<GameModel>;
}