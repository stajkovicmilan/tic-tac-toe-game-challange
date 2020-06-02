import { User } from "../../models/User";

export interface IAuth {

    getUserByTokenFromRequest( req: any ): Promise<User | null>;
    authenticated( user: User ): User;

}