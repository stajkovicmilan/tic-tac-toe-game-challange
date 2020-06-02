import { Container } from "inversify";

import Types from "./Types";
import { IRegistry } from "./IRegistry";
import { IDB } from "../../db/IDB";
import { DB } from "../../db/DB";
import { IUsersService } from "../../../services/IUsersService";
import { UsersService } from "../../../services/UsersService";

export class Registry implements IRegistry {
    public register(container: Container): Container {

        container.bind<IDB>(Types.IDB).to(DB);
        container.bind<IUsersService>(Types.IUsersService).to(UsersService);

        return container;
    }
}
