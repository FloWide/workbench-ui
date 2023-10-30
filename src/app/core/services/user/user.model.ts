export interface UserModel {
    git_service_id: number;
    username: string
    email: string;
}

export interface Users {
    [key:number]: UserModel;
}