import crypto from 'crypto';

import { IUsersService } from "./IUsersService";
import { injectable, inject } from 'inversify';
import { Types } from '../core/dependency-injection';
import { User } from '../models/User';
import { IDB } from '../core/db/IDB';
import { IAuth } from '../core/auth/IAuth';

@injectable()
export class UsersService implements IUsersService {

  constructor(
    @inject(Types.IDB) private db: IDB,
    @inject(Types.IAuth) private auth: IAuth) { }

  userTypeDefs() {
    let typeDefs = `
          type User {
            firstName: String,
            lastName: String,
            id: String,
            token: String,
            permissionLevel: Int,
            email: String
          } `;
    typeDefs += ` 
          extend type Query {
          users(
            id: String): [User]
        }
        `;

    typeDefs += `
          extend type Mutation {
            user(firstName:String,
             lastName: String,
             password: String,
             permissionLevel: Int,
             email: String,
             id: String): User!
          }`;
    return typeDefs;
  }

  userResolvers(resolvers: any): any {
    resolvers.Query.users = async (_root: any, _args: any, _context: any, _info: any) => {
      const authenticatedUser: User = this.auth.authenticated(_context.user);
      const users: User[] = await this.db.getUsers()
      return users;
    };
    resolvers.Mutation.user = (_root: any, _args: any, _context: any, _info: any) => {
      const salt = crypto.randomBytes(16).toString('base64');
      // const hash = crypto.createHmac('sha512', salt).update(user.password).digest("base64");
      // user.password = hash;
      // return user;
    };

  }

}