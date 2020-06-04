import { Container } from "inversify";

import Types from "./Types";
import { IRegistry } from "./IRegistry";
import { IDB } from "../db/IDB";
import { DB } from "../db/DB";
import { IUsersService } from "../../services/IUsersService";
import { UsersService } from "../../services/UsersService";
import { IAuth } from "../auth/IAuth";
import { Auth } from "../auth/Auth";
import { IGame } from "../game/IGame";
import { Game } from "../game/Game";
import { IGameService } from "../../services/IGameService";
import { GameService } from "../../services/GameService";

export class Registry implements IRegistry {
    public register(container: Container): Container {

        container.bind<IDB>(Types.IDB).to(DB);
        container.bind<IAuth>(Types.IAuth).to(Auth);
        
        container.bind<IUsersService>(Types.IUsersService).to(UsersService);
        container.bind<IGameService>(Types.IGameService).to(GameService);
        
        container.bind<IGame>(Types.IGame).to(Game);

        return container;
    }
}
