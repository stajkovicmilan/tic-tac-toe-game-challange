import { UserModel } from "../../models/UserModel";

export interface IAuth {

    getUserByTokenFromRequest( req: any ): Promise<UserModel | null>;
    authenticated( user: UserModel ): UserModel;

}