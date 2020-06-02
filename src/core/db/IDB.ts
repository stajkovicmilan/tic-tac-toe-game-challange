import { User } from "../../models/user.model";

export interface IDB {

    getUsers(): Promise<User[]>;
    getUser( id: string ): Promise<User>;
    getUserByPasswordAndEmail( password: string, email: string ): Promise<User>;
    getUserByToken( token: string ): Promise<User>;
    registerUser( password: string, email: string ): Promise<User>;
    // getGames(): Promise<Game[]>;
    // createGame( gameInput: Game, userId: string ): Promise<Game>;

}