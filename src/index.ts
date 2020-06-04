import "reflect-metadata";
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

import { kernel, Types } from './core/dependency-injection';
import { IUsersService } from './services/IUsersService';
import { IAuth } from "./core/auth/IAuth";
import { IGameService } from "./services/IGameService";

const port = 3000;
const subscriptionsEndpoint = `ws://localhost:${port}/subscriptions`;

const app: express.Application = express();

const usersService = kernel.get<IUsersService>(Types.IUsersService);
const gameService = kernel.get<IGameService>(Types.IGameService);
const auth = kernel.get<IAuth>(Types.IAuth);

let typeDefs: any = `
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
  `;

const resolvers = {
  Query: {},
  Mutation: {},
  Subscription: {}
};

// Set "typeDef"
typeDefs += usersService.userTypeDefs();
typeDefs += gameService.gameTypeDefs();

// Set "resolvers"
usersService.userResolvers(resolvers);
gameService.gameResolvers(resolvers);

// Create schema
const Schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  '/graphql',
  graphqlHTTP(async (req, res, graphQLParams) => {
    const user = await auth.getUserByTokenFromRequest(req);
    return ({
      schema: Schema,
      context: {
        user: user,
      },
      pretty: true,
      graphiql: true,
      subscriptionsEndpoint: subscriptionsEndpoint
    });
  })
);

const server = createServer(app);
server.listen(port, () => {
  // tslint:disable-next-line: no-unused-expression
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema: Schema,
    },
    {
      server,
      path: '/subscriptions',
    },
  );
  console.log(`Node Graphql API listening on port ${port}, and route "/graphql"!`);
  console.log(`Node Graphql Subscriptions API listening on endpoint "${subscriptionsEndpoint}"!`);
});
