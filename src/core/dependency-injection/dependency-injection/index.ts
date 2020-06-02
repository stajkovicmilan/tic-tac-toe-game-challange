import Types from "./Types";
import { IRegistry } from "./IRegistry";
import { Bootstrap } from "./Bootstrap";

const kernel = Bootstrap.initialize();

export { Types, kernel, IRegistry };
