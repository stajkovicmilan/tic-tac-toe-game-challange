import { UserModel } from "../../models/UserModel";
import { GameModel } from "../../models/GameModel";

export interface IDB {

    getUsers(): Promise<UserModel[]>;
    getUser( id: string ): Promise<UserModel>;
    getUserByPasswordAndEmail( password: string, email: string ): Promise<UserModel>;
    getUserByToken( token: string ): Promise<UserModel>;
    registerUser( user: UserModel ): Promise<UserModel>;
    addGame(newGame: GameModel): Promise<GameModel>;
    getUserActiveGame(userId: string): Promise<GameModel | undefined>;
    getUserInactiveGames(userId: string): Promise<GameModel[]>;
    getAllUserGames(userId: string): Promise<GameModel[]>;
    getGameById(gameId: string): Promise<GameModel | undefined>;
    updateGame(game: GameModel): Promise<GameModel>;
    availableMultiPlayerGame(): Promise<GameModel[]>;
}