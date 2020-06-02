import "reflect-metadata";
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import expressPlayground from 'graphql-playground-middleware-express'; 

import { kernel, Types } from './core/dependency-injection';
import { IUsersService } from './services/IUsersService';
import { IAuth } from "./core/auth/IAuth";

const app: express.Application = express();
const port = 3000;
const usersService = kernel.get<IUsersService>(Types.IUsersService);
const auth = kernel.get<IAuth>(Types.IAuth);

let typeDefs: any = [`
  type Query {
    hello: String
  }
     
  type Mutation {
    hello(message: String) : String
  }
`];

let helloMessage: string = 'World!';

const resolvers = {
    Query: {
        hello: () => helloMessage
    },
    Mutation: {
        hello: (_: any, helloData: any) => {
            helloMessage = helloData.message;
            return helloMessage;
        }
    }
};

// let productsService = new ProductsService();
// typeDefs += productsService.configTypeDefs();
typeDefs += usersService.userTypeDefs();

// productsService.configResolvers(resolvers);
usersService.userResolvers(resolvers);

app.use(
    '/graphql',
    graphqlHTTP(async (req, res, graphQLParams) => {
      const user = await auth.getUserByTokenFromRequest(req);
      return ({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
        context: {
          user
        },
        pretty: true,
        graphiql: false
      });
    })
);
// app.use(express.json()) // for parsing application/json
// app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
app.listen(port, () => console.log(`Node Graphql API listening on port ${port}!`));
