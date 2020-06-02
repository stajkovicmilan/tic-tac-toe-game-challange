import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as createUUID } from 'uuid';

import { IDB } from './IDB';
import { User } from '../../models/user.model';
import { injectable } from "inversify";

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
    this.adapter = new FileSync('db.json');
    this.db = lowdb(this.adapter);
    this.db.defaults({
      games: [],
      users: [],
    }).write();
  }

  // get all user's
  public async getUsers(): Promise<User[]> {
    const users = this.db.get('users')
      .value();
    return users;
  }

  // get a user's public data by it's id.
  public async getUser(id: string): Promise<User> {
    const users = this.db.get('users')
      .find({ id })
      .value();
    return users;
  }

  // gets a user by it's password and email.
  public async getUserByPasswordAndEmail(password: string, email: string): Promise<User> {
    const hash = bcrypt.hashSync(password, this.hashSalt);
    const user = this.db.get('users')
      .find({ email, password: hash })
      .value();
    return user;
  }

  public async getUserByToken(token: string): Promise<User> {
    const user = this.db.get('users')
      .find({ token })
      .value();
    return user;
  }

  public async registerUser(password: string, email: string): Promise<User> {
    const existingUser = this.db
      .get('users')
      .find({ email })
      .value();

    if (existingUser) {
      throw new Error('User already exist');
    }

    const id = createUUID();
    const hash = bcrypt.hashSync(password, this.hashSalt);
    const token = jsonwebtoken.sign(
      { id },
      this.jwtSecret,
    );

    const user: User = {
      email,
      id,
      token,
      password: hash,
      firstName: '',
      lastName: '',
      permissionLevel: 1
    };

    this.db.get('users')
      .push(user)
      .write();
    return user;
  }

  // get all the games
  // public async getGames(): Promise<Game[]> {}
  // public async createGame( gameInput: Game, userId: string ): Promise<Game> {}

}