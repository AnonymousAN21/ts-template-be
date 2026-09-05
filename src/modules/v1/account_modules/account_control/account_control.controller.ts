import { Request, Response } from "express";
import accountServices from "./account_control.services.js";
import ApiResponse from "../../../../utils/response.handler.js";
import ApiError from "../../../../utils/app_error.handler.js";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { IAccountDTO } from "../../../../interfaces/account.interface.js";
import { IPaginationResult } from "../../../../interfaces/additional/request.wrapper.js";


class AccountController {

    public GetById = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const ID = req.params.id as string;

        try{
            if(!Types.ObjectId.isValid(ID))
                return r.error(`Couldn't find user with that id`, StatusCodes.NOT_FOUND);

            const userID = new Types.ObjectId(ID);
            const data: IAccountDTO = await accountServices.getUserById(userID);

            return r.success(data, "User fetched successfully");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error(
                "An unexpected server error occurred during fetching",
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    public GetAll = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const filter = req.query;

        try{

            const data: IPaginationResult<IAccountDTO> = await accountServices.getUserAll(filter, page, limit);

            return r.successPagination(data.data, data.meta);
        }catch(error){
            
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error(
                "An unexpected server error occurred during fetching",
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }
}

const accountController = new AccountController();
export default accountController;