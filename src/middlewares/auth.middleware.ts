import { NextFunction, Request, Response } from "express"
import ApiResponse from "../utils/response.handler.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import Account from "../config/database/mongodb/schema/account.model.js";
import { IAccount } from "../interfaces/account.interface.js";
import Role from "../config/database/mongodb/schema/role.model.js";
import Show from "../utils/error.handler.js";

const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;
export const Authenticate = (role?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const r = new ApiResponse(res);
        const authorization = req.headers["authorization"];

        if(!authorization || !authorization.startsWith("Bearer "))
            return r.error("Access Denied.", StatusCodes.UNAUTHORIZED);

        const token = authorization.split(" ")[1];

        try{
            if(!SECRET_KEY)
                return r.error("Failed to verify the Session ID.", StatusCodes.FORBIDDEN)

            const decoded = jwt.verify(token, SECRET_KEY) as IAccount;

            if(role && role.length > 0){
                const isRoleExist = await Role.find({role_name: {$in : role}})

                if(!decoded.username || !isRoleExist){
                    Show({text: "Role Might not exist"})

                    // console log out all the role that's get set as the parameter
                    let output = ""
                    for(let i = 0; i < role.length; i++){
                        output += role[i] + " ";
                    }
                    console.log(output);
                    return r.error("Failed to verify the Session ID.", StatusCodes.FORBIDDEN)
                }

                const userAccount = await Account.findOne({username: decoded.username}).populate("role");

                if(!userAccount)
                    return r.error("Account can't be found.", StatusCodes.UNAUTHORIZED)

                const userRoleNames = userAccount.role.map((r: any) => r.role_name)
                const hasRequiredRole = userRoleNames.some((rName: string) => role.includes(rName));

                if(!hasRequiredRole)
                    return r.error("You do not have permission to perform this action.", StatusCodes.FORBIDDEN);
                
            }

            req.user = decoded;

            next();
        }catch(error){
            if(error instanceof jwt.TokenExpiredError) {
                return r.error("Session is Expired.", StatusCodes.UNAUTHORIZED)
            }

            return r.error("Invalid Session ID.", StatusCodes.UNAUTHORIZED  )
        }
    }
}


export const VerifySession = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const r = new ApiResponse(res);
        const refresh_token = req.cookies.refresh_token;

        if(!refresh_token)
            return r.error("Failed to refresh session, please re-login into the account.", StatusCodes.UNAUTHORIZED);

        try{
            if(!SECRET_REFRESH_KEY)
                return r.error("Failed to verify the Session ID.", StatusCodes.FORBIDDEN);

            const decoded = jwt.verify(refresh_token, SECRET_REFRESH_KEY) as IAccount;

            req.user = decoded;
            next();
        }catch(error){
            if (error instanceof jwt.TokenExpiredError){
                return r.error("Session is Expired.", StatusCodes.UNAUTHORIZED)
            }

            return r.error("Invalid Refresh Session ID.", StatusCodes.UNAUTHORIZED)
        }
    }
}