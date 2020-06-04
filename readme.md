# CodingChallenge
## tic-tac-toe-game-challange

This project was build in  [Node.js](https://nodejs.org/) version 12.13.0.

## Development server

Run `npm run start` to run server.  Navigate to `http://localhost:3000/`. Or just hit F5 to build app and to run server if you are using `Visual Studio Code`.

## Build

Run `npm run build-test` to build app.

# Project tasks:

- Create a new game
- Join an existing game
- Make a new move
- Get live results via subscription
- Get history for a game by id

# Solutions:
- ### API service

  - `src/services`
  - Handles all logic for "graphql" server, and provides methods for getting Schemes and Resolvers.

- ### Models

  - UserModel

    ```
    UserModel {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        token?: string;
        permissionLevel?: number;
    }
    ```

  - GameModel
    
    ```
    GameModel{
        id: string;
        type: GameType;
        status: GameStatus;
        winner: GameWinner;
        firstPlayerId: string;
        firstPlayerName: string;
        firstPlayerMoves: number[];
        secondPlayerId?: string;
        secondPlayerName?: string;
        secondPlayerMoves: number[];
        gameMoves: number[];
        playerOnMoveId: string;
        winningCombination?: number[];
    }
    ```

- ### Core
  - Auth
    - `src/core/auth`
    - Handles logic for Authentication and Authorization.
  - DB
    - `src/core/db`
    - Handles logic for `CRUD` operations on database.
  - Dependency Injection
    - `src/core/dependency-injection`
    - Handles DI logic by containing all registries and provide them.
    - Package used for DI is `inversify`
  - Game
    - `src/core/game`
    - Handles all main logic for `Tic-Tac-Toe` game.

# Technical choices:
- # [Node.js](https://nodejs.org/)
    - As an asynchronous event-driven JavaScript runtime, Node.js is designed to build scalable network applications.
    - Material Design it moved a step forward adding fresh styles and animations to its components. Our app becomes more interactive and that is one of the greatest features making user experience more pleasing than ever before.
- # [GraphQL](https://graphql.org/)
    - GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.
- # [TypeScript](https://graphql.org/)  
    - TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.