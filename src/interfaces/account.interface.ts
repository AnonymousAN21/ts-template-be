import { Types } from "mongoose";

export interface IAccount{
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    email: string;
    about_me?: string;
}

export interface IAccountDTO{
    _id?: Types.ObjectId;
    first_name?: string;
    last_name?: string;
    username?: string;
    password?: string;
    email?: string;
    about_me?: string | null;
}



export interface ISession{
    token: string,
    refresh_token: string
}