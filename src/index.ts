import "reflect-metadata";
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import expressPlayground from 'graphql-playground-middleware-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

import { kernel, Types } from './core/dependency-injection';
import { IUsersService } from './services/IUsersService';
import { IAuth } from "./core/auth/IAuth";

const app: express.Application = express();
const port = 3000;
const usersService = kernel.get<IUsersService>(Types.IUsersService);
const auth = kernel.get<IAuth>(Types.IAuth);

let typeDefs: any = [`
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  type Query {
    hello: String
  }
     
  type Mutation {
    hello(message: String) : String
  }

  type Subscription {
    userAdded(id: String): User
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
  },
  Subscription: {}
};

// let productsService = new ProductsService();
// typeDefs += productsService.configTypeDefs();
typeDefs += usersService.userTypeDefs();

// productsService.configResolvers(resolvers);
usersService.userResolvers(resolvers);

// Create schema
const Schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  '/graphql',
  graphqlHTTP(async (req, res, graphQLParams) => {
    const user = await auth.getUserByTokenFromRequest(req);
    return ({
      schema: Schema,
      context: {
        user
      },
      pretty: true,
      graphiql: false,
      subscriptionsEndpoint: `ws://localhost:${port}/subscriptions`
    });
  })
);
// app.use(express.json()) // for parsing application/json
// app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));


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
  console.log(`Node Graphql Subscriptions API listening on port ${port}, and route "/subscriptions"!`);
});
