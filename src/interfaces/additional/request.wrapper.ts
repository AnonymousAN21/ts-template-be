import { Request } from "express";
import { IAccount } from "../account.interface.js";

export interface AccountRequest extends Request {
    user: IAccount
}

export interface IPaginationResult<T> {
    data: T[];
    meta: IPaginationMeta
}

export interface IPaginationMeta {
    totalItems: number;
    currentPage: number;
    itemPerPage: number;
    totalPages: number;
}