import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/response.handler.js";

export const validate = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            })

            return next();
        }catch(error){
            const r = new ApiResponse(res);

            if(error instanceof ZodError){
                const validationErrors = error.issues.map((err) => ({
                    field: err.path.join("."), 
                    message: err.message,
                }));
                
                return r.error(
                    "Validation Failed.",
                    StatusCodes.UNPROCESSABLE_ENTITY,
                    validationErrors
                )
            }

            return r.error("Internal Server Error during validation", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}