import { PubSub } from 'graphql-subscriptions';

import { IUsersService } from "./IUsersService";
import { injectable, inject } from 'inversify';
import { Types } from '../core/dependency-injection';
import { UserModel } from '../models/UserModel';
import { IDB } from '../core/db/IDB';
import { IAuth } from '../core/auth/IAuth';

@injectable()
export class UsersService implements IUsersService {

  public pubsub = new PubSub();

  constructor(
    @inject(Types.IDB) private db: IDB,
    @inject(Types.IAuth) private auth: IAuth) { }

  userTypeDefs() {
    const typeDefs = `
          type User {
            firstName: String
            lastName: String
            email: String
            id: String
            token: String
            permissionLevel: Int
          }
          
          type Query {
            loginUser(
              password: String!,
              email: String!): [User]
          }

          type Mutation {
            registerUser(firstName: String!,
             lastName: String!,
             password: String!,
             email: String!): User!
          }
          `;
    return typeDefs;
  }

  userResolvers(resolvers: any): any {
    resolvers.Query.loginUser = async (_root: any, _args: any, _context: any, _info: any) => {
      const user: UserModel = await this.db.getUserByPasswordAndEmail(_args.password, _args.email);
      return user;
    };
    resolvers.Mutation.registerUser = async (_root: any, _args: any, _context: any, _info: any) => {
      let newUser: UserModel = {
        email: _args.email ? _args.email : null,
        password: _args.password ? _args.password : null,
        firstName: _args.firstName ? _args.firstName : null,
        lastName: _args.lastName ? _args.lastName : null,
        permissionLevel: 1
      }
      newUser = await this.db.registerUser(newUser);
      return newUser;
    };
  }

}