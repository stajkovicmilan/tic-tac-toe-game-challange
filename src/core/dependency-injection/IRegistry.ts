import { Container } from "inversify";

export interface IRegistry {
    register(container: Container): Container;
}
