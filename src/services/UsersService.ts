import crypto from 'crypto';

import { IUsersService } from "./IUsersService";
import { injectable, inject } from 'inversify';
import { Types } from '../core/dependency-injection/dependency-injection';
import { User } from '../models/user.model';
import { IDB } from '../core/db/IDB';

@injectable()
export class UsersService implements IUsersService {

  constructor(@inject(Types.IDB) private db: IDB) { }

  userTypeDefs() {
    let typeDefs = `
          type User {
            firstName: String,
            lastName: String,
            id: String,
            password: String,
            permissionLevel: Int,
            email: String
          } `;
    typeDefs += ` 
          extend type Query {
          users: [User]
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
    resolvers.Query.users = async () => {
      const users: User[] = await this.db.getUsers()
      return users;
    };
    resolvers.Mutation.user = (_: any, user: any) => {
      const salt = crypto.randomBytes(16).toString('base64');
      const hash = crypto.createHmac('sha512', salt).update(user.password).digest("base64");
      user.password = hash;
      return user;
    };

  }

}