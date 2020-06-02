export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    token: string;
    permissionLevel: number;
}