import { IAccount } from "../../../interfaces/account.interface.ts";

declare global {
    namespace Express {
        interface Request {
            user?: IAccount; 
        }
    }
}