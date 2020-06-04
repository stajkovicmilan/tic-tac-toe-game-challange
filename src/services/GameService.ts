import { PubSub } from 'graphql-subscriptions';

import { injectable, inject } from 'inversify';
import { Types } from '../core/dependency-injection';
import { UserModel } from '../models/UserModel';
import { IDB } from '../core/db/IDB';
import { IAuth } from '../core/auth/IAuth';
import { IGameService } from './IGameService';
import { IGame } from '../core/game/IGame';
import { GameModel, GameType, GameSubTypes } from '../models/GameModel';

@injectable()
export class GameService implements IGameService {

    public pubsub = new PubSub();

    constructor(
        @inject(Types.IDB) private db: IDB,
        @inject(Types.IAuth) private auth: IAuth,
        @inject(Types.IGame) private game: IGame) { }

    gameTypeDefs() {
        const typeDefs = `
          type Game {
            id: String
            type: String
            status: String
            winner: String
            firstPlayerId: String
            firstPlayerName: String
            firstPlayerMoves: [Int]
            secondPlayerId: String
            secondPlayerName: String
            secondPlayerMoves: [Int]
            gameMoves: [Int]
            playerOnMoveId: String
            winningCombination: [Int]
          }
          
          extend type Query {
            getGame(id: String!): Game
          }

          extend type Query {
            availableMultiPlayerGame: [Game]
          }

          extend type Query {
            getUserActiveGame: Game
          }

          extend type Query {
            getAllUserGames: [Game]
          }

          extend type Query {
            getUserInactiveGames: [Game]
          }

          extend type Mutation {
            createGame(gameType: String!): Game
          }

          extend type Mutation {
            joinMultiPlayerGame(gameId: String!): Game
          }

          extend type Mutation {
            makeMoveInSinglePlayerGame(
                gameId: String!,
                move: Int!): Game
          }

          extend type Mutation {
            makeMoveInMultiPlayerGame(
                gameId: String!,
                move: Int!): Game
          }

          extend type Mutation {
            endGame(gameId: String!): Game
          }
          
          type Subscription {
            subscribeToMultiplayerGame(
                userId: String!,
                gameId: String!): Game
          }
          
          extend type Subscription {
            subscribeToMultiplayerGamePlayerJoin(
                userId: String!,
                gameId: String!): Game
          }
          
          extend type Subscription {
            subscribeToMultiplayerGameEnd(
                userId: String!,
                gameId: String!): Game
          }`;
        return typeDefs;
    }

    gameResolvers(resolvers: any): any {

        resolvers.Query.getGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const game: GameModel | undefined = await this.db.getGameById(_args.id);
            if (!game) {
                throw new Error('Game not found!');
            }
            if (game.firstPlayerId !== _context.user.id ||
                !game.secondPlayerId !== _context.user.id) {
                throw new Error('You are not part of this game!');
            }
            return game;
        };

        resolvers.Query.availableMultiPlayerGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const games: GameModel[] = await this.db.availableMultiPlayerGame();
            return games;
        };

        resolvers.Query.getUserActiveGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const game: GameModel | undefined = await this.db.getUserActiveGame(authenticatedUser.id ? authenticatedUser.id : '');
            return game;
        };

        resolvers.Query.getAllUserGames = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const games: GameModel[] = await this.db.getAllUserGames(authenticatedUser.id ? authenticatedUser.id : '');
            return games;
        };

        resolvers.Query.getUserInactiveGames = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const games: GameModel[] = await this.db.getUserInactiveGames(authenticatedUser.id ? authenticatedUser.id : '');
            return games;
        };

        resolvers.Mutation.createGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            if (!Object.values(GameType).includes(_args.gameType)) {
                throw new Error('You did not provide right "gameType" value!');
            }
            const newGame = await this.game.createGame(authenticatedUser, _args.gameType);
            return newGame;
        };

        resolvers.Mutation.joinMultiPlayerGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const game: GameModel = await this.game.joinMultiPlayerGame(authenticatedUser, _args.gameId);
            this.pubsub.publish(GameSubTypes.PLAYER_ADDED, {
                subscribeToMultiplayerGamePlayerJoin: game
            });
            return game;
        };

        resolvers.Mutation.makeMoveInMultiPlayerGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const game: GameModel = await this.game.makeMoveInMultiPlayerGame(authenticatedUser, _args.gameId, _args.move);
            this.pubsub.publish(GameSubTypes.NEW_GAME_MOVE, {
                subscribeToMultiplayerGame: game
            });
            return game;
        };

        resolvers.Mutation.endGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const game: GameModel = await this.game.endGame(authenticatedUser, _args.gameId);
            if (game.type === GameType.MULTI_PLAYER) {
                this.pubsub.publish(GameSubTypes.GAME_END, {
                    subscribeToMultiplayerGameEnd: game
                });
            }
            return game;
        };

        resolvers.Mutation.makeMoveInSinglePlayerGame = async (_root: any, _args: any, _context: any, _info: any) => {
            const authenticatedUser: UserModel = this.auth.authenticated(_context.user);
            const game: GameModel = await this.game.makeMoveInSinglePlayerGame(authenticatedUser, _args.gameId, _args.move);
            return game;
        };

        resolvers.Subscription.subscribeToMultiplayerGame = {
            // resolve: (_root: any, _args: any, _context: any, _info: any) => {
            //   return this.auth.authenticated(_context.user);
            // },
            subscribe: (_root: any, _args: any, _context: any, _info: any) => {
                return this.pubsub.asyncIterator(GameSubTypes.NEW_GAME_MOVE)
            }
        }

        resolvers.Subscription.subscribeToMultiplayerGamePlayerJoin = {
            subscribe: (_root: any, _args: any, _context: any, _info: any) => {
                return this.pubsub.asyncIterator(GameSubTypes.PLAYER_ADDED)
            }
        }

        resolvers.Subscription.subscribeToMultiplayerGameEnd = {
            subscribe: (_root: any, _args: any, _context: any, _info: any) => {
                return this.pubsub.asyncIterator(GameSubTypes.GAME_END)
            }
        }
    }

}