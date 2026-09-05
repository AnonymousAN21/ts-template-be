import { Types } from "mongoose";
import Account from "../../../../config/database/mongodb/schema/account.model.js";
import { IAccountDTO } from "../../../../interfaces/account.interface.js";
import ApiError from "../../../../utils/app_error.handler.js";
import { StatusCodes } from "http-status-codes";
import { IPaginationResult } from "../../../../interfaces/additional/request.wrapper.js";

/**
 * TO-DO:
 * 1. Search User by id
 * 2. Search User by Filter
 * 3. Update User by Filter
 * 4. Update User by id
 * 5. Delete User by Filter
 * 6. Delete User by id
 */

// this class or controller mainly can be access only by admin
class AccountControlServices{
    constructor(){}
    
    public async getUserById(accountID: Types.ObjectId): Promise<IAccountDTO> {
        try{
            const User = await Account.findById(accountID).lean();
            
            if(!User)
                throw new ApiError(`Account with id: ${accountID} was Not found.`, StatusCodes.NOT_FOUND);

            const data: Record<string, unknown> = {};

            for(const [key, val] of Object.entries(User)){
                if(key !== "password"){
                    data[key] = val;
                }
            }

            return data;
        }catch{
            throw new ApiError(`Failed to get user by id: ${accountID}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async getUserAll(filter: IAccountDTO, page: number = 1, limit: number = 5): Promise<IPaginationResult<IAccountDTO>> {
        try{
            const skipIndex = (page - 1) * limit;
            const [users, totalItems] = await Promise.all([
                Account.find(filter).skip(skipIndex).limit(limit),
                Account.countDocuments(filter)
            ]);

            return {
                data: users,
                meta: {
                    totalItems,
                    currentPage: page,
                    itemPerPage: limit,
                    totalPages: Math.ceil(totalItems / limit)
                }
            }
        }catch{
            throw new ApiError(`Failed to get User`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}


const accountServices = new AccountControlServices();
export default accountServices;