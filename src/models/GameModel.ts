export interface GameModel {
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

export enum GameType {
    SINGLE_PLAYER = 'SINGLE_PLAYER',
    MULTI_PLAYER = 'MULTI_PLAYER'
}

export enum GameStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum GameWinner {
    FIRST_PLAYER = 'FIRST_PLAYER',
    SECOND_PLAYER = 'SECOND_PLAYER',
    DRAW_GAME = 'DRAW_GAME',
    UNKNOWN = 'UNKNOWN'
}