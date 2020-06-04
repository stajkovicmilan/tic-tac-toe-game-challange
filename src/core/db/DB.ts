import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as createUUID } from 'uuid';

import { IDB } from './IDB';
import { UserModel } from '../../models/UserModel';
import { injectable } from "inversify";
import { GameModel, GameStatus, GameType } from '../../models/GameModel';

@injectable()
export class DB implements IDB {

  /*
  * NOTICE! these secrets are here for simplicity,
  * please don't save secrets inside your code, 
  * but in environment variables or config files that will not be in the repository
  *
  * this entire file is only to mock a local database. it is not ment to act as a real database.
  */
  // some salt for hashing the password
  protected hashSalt = '$2a$10$7h/0SQ4FXRG5eX3602o3/.aO.RYkxKuhGkzvIXHLUiMJlFt1P.6Pe';
  // a secret for signing with jwt
  protected jwtSecret = 'oCDSF$#%$#%dfsvdgfd#@$3f';

  // our database
  protected adapter: any;
  protected db: any;

  constructor() {
    this.adapter = new FileSync('./dist/db.json');
    this.db = lowdb(this.adapter);
    this.db.defaults({
      games: [],
      users: [],
    }).write();
  }

  // get all user's
  public async getUsers(): Promise<UserModel[]> {
    const users = this.db.get('users')
      .value();
    return users;
  }

  // get a user's public data by it's id.
  public async getUser(id: string): Promise<UserModel> {
    const users = this.db.get('users')
      .find({ id })
      .value();
    return users;
  }

  // gets a user by it's password and email.
  public async getUserByPasswordAndEmail(password: string, email: string): Promise<UserModel> {
    const hash = bcrypt.hashSync(password, this.hashSalt);
    const user = this.db.get('users')
      .find({ email, password: hash })
      .value();
    return user ? user : null;
  }

  public async getUserByToken(token: string): Promise<UserModel> {
    const user = this.db.get('users')
      .find({ token })
      .value();
    return user ? user : null;
  }

  public async registerUser(user: UserModel): Promise<UserModel> {
    const existingUser = this.db
      .get('users')
      .find({ email: user.email })
      .value();

    if (existingUser) {
      throw new Error('User already exist');
    }

    const id = createUUID();
    const hash = bcrypt.hashSync(user.password, this.hashSalt);
    const token = jsonwebtoken.sign(
      { id },
      this.jwtSecret,
    );

    user.id = id;
    user.password = hash;
    user.token = token;

    this.db.get('users')
      .push(user)
      .write();
    return user;
  }

  public async addGame(newGame: GameModel): Promise<GameModel> {
    this.db.get('games')
      .push(newGame)
      .write();
    return newGame;
  }

  public async getUserActiveGame(userId: string): Promise<GameModel | undefined> {
    const games: GameModel[] = await this.db.get('games')
      .value();
    const activeGame: GameModel | undefined = games.find(game => {
      return (game.firstPlayerId === userId || game.secondPlayerId === userId) && game.status === GameStatus.ACTIVE;
    })
    return activeGame;
  }

  public async getUserInactiveGames(userId: string): Promise<GameModel[]> {
    const games: GameModel[] = await this.db.get('games')
      .value();
    const inactiveGame: GameModel[] = games.filter(game => {
      return (game.firstPlayerId === userId || game.secondPlayerId === userId) && game.status === GameStatus.INACTIVE;
    })
    return inactiveGame;
  }

  public async getAllUserGames(userId: string): Promise<GameModel[]> {
    let games: GameModel[] = await this.db.get('games')
      .value();
    games = games.filter(game => game.firstPlayerId === userId || game.secondPlayerId === userId)
    return games;
  }

  public async availableMultiPlayerGame(): Promise<GameModel[]> {
    let games: GameModel[] = await this.db.get('games')
      .value();
    games = games.filter(game => !game.secondPlayerId && game.type === GameType.MULTI_PLAYER && game.status === GameStatus.ACTIVE)
    return games;
   }

  public async getGameById(gameId: string): Promise<GameModel> {
    const game = this.db.get('games')
      .find({ id: gameId })
      .value();
    return game ? game : null;
  }

  public async updateGame(game: GameModel): Promise<GameModel> {
    await this.db.get('games')
      .find({ id: game.id })
      .assign({ ...game })
      .write()
    return game;
  }

}