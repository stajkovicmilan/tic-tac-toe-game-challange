import { Container } from "inversify";
import { Registry } from "./Registry";

export class Bootstrap {
    public static Kernel: Container;

    public static initialize(): Container {
        if (!Bootstrap.Kernel) {
            Bootstrap.Kernel = new Container();
            const coreRegistry = new Registry();
            Bootstrap.Kernel = coreRegistry.register(Bootstrap.Kernel);
        }
        return Bootstrap.Kernel;
    }
}
