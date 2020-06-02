import "reflect-metadata";
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { kernel, Types } from './core/dependency-injection/dependency-injection';
import { IUsersService } from './services/IUsersService';

const app: express.Application = express();
const port = 3000;

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
const usersService = kernel.get<IUsersService>(Types.IUsersService);
// typeDefs += productsService.configTypeDefs();
typeDefs += usersService.userTypeDefs();

// productsService.configResolvers(resolvers);
usersService.userResolvers(resolvers);

app.use(
    '/graphql',
    graphqlHTTP({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
        graphiql: true
    })
);
app.listen(port, () => console.log(`Node Graphql API listening on port ${port}!`));
