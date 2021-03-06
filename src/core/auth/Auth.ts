import { injectable, inject } from "inversify";

import { IAuth } from "./IAuth";
import { Types } from "../dependency-injection";
import { IDB } from "../db/IDB";
import { UserModel } from "../../models/UserModel";

@injectable()
export class Auth implements IAuth {

    constructor(@inject(Types.IDB) private db: IDB) { }

    public async getUserByTokenFromRequest(req: any): Promise<UserModel | null> {
        let authToken = null;
        let currentUser = null;
        try {
            
            if (req && req.headers && req.headers.authorization && typeof req.headers.authorization === 'string') {
                authToken = req.headers.authorization.split(" ")[1];
            }

            if (authToken) {
                currentUser = await this.db.getUserByToken(authToken);
            }
        } catch (e) {
            console.warn(`Unable to authenticate using auth token: ${authToken}`);
        }

        return currentUser;
    }

    authenticated(user: UserModel): UserModel {
        if (!user) {
            throw new Error(`Unauthenticated!`);
        }
        return user;
    }

}