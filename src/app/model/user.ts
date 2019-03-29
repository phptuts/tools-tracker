export interface User {
    email: string;
    username: string;
    attributes: Array<{key: string, value: string}>;
}

