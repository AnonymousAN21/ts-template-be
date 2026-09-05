import authenticationServices from "./account.services.js";
import { IAccount, IAccountDTO } from "../../../../interfaces/account.interface.js";
import { Request, Response } from "express";
import Token from "../../../../config/database/mongodb/schema/additional.model/session.model.js";
import ApiResponse from "../../../../utils/response.handler.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../utils/app_error.handler.js";
import jwt from "jsonwebtoken"
import Account from "../../../../config/database/mongodb/schema/account.model.js";
import { isValidObjectId } from "mongoose";


const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;

class AuthenticationController{

    private service: typeof authenticationServices;
    constructor(service: typeof authenticationServices){
        this.service = service
    }

    private IsEnvLoaded(): boolean {
        if(!SECRET_KEY || !SECRET_REFRESH_KEY){
            return false;
        } 
        return true;
    }

    public register = async(req: Request, res: Response): Promise<Response> => {
        const body: IAccount = req.body;
        const r = new ApiResponse(res);
        try{
            const newAccount = await this.service.create_account(body);

            if(!newAccount){
                return r.error("Registration Failed", StatusCodes.BAD_REQUEST);
            }
            
            const accessToken = jwt.sign(
                { username: newAccount.username, email: newAccount.email },
                process.env.SECRET_KEY!,
                { expiresIn: "1h" }
            );

            const refreshToken = jwt.sign(
                { username: newAccount.username, email: newAccount.email },
                process.env.SECRET_REFRESH_KEY!,
                { expiresIn: "30d" }
            );

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await Token.create({
                account_id: newAccount._id,
                refresh_token: refreshToken,
                device_info: req.headers["user-agent"] || "Unknown Device",
                ip_address: req.ip,
                expires_at: expiresAt
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.ENVIRONMENT === "PROD",
                sameSite: "strict",
                expires: expiresAt
            });

            return r.success(
                {
                    user: {
                        first_name: newAccount.first_name,
                        last_name: newAccount.last_name,
                        username: newAccount.username,
                        email: newAccount.email,
                        about_me: newAccount.about_me
                    },
                    token: accessToken
                },
                "Account created successfully",
                StatusCodes.CREATED
            );
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }
            return r.error(
                "An unexpected server error occurred during registration", 
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    } 

    public login = async(req: Request, res: Response): Promise<Response> => {
        const r = new ApiResponse(res);
        try{
            const body: IAccountDTO = req.body;

            const login = await this.service.verify({username: body.username, email: body.email, password: body.password}, {user_agent: req.headers["user-agent"] || "Unkown Device", ip: req.ip || "Unkown IP"})

            if(!login){
                return r.error("Login Failed.", StatusCodes.FORBIDDEN);
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            res.cookie("refresh_token", login.refresh_token, {
                httpOnly: true,
                secure: process.env.ENVIRONMENT === "PROD",
                sameSite: "strict",
                expires: expiresAt
            })

            return r.success(
                {
                    session_id: login.token
                },
                "Login Success."
            )
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error(
                "An unexpected server error occurred during authentication",
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }


    public refresh_session = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        try{
            const user_agent = req.headers["user-agent"] || "Unkown Device";
            const ip = req.ip || "Unkown IP";
            const userData = req.user;

            if(!userData)
                return r.error("Account can't be found.", StatusCodes.UNAUTHORIZED);
            
            const refresh_session = await this.service.refresh_session({
                username: userData.username || undefined,
                email: userData.email || undefined,
            },{
                user_agent,
                ip
            })

            if(!refresh_session){
                return r.error("Failed to refresh session.", StatusCodes.FORBIDDEN)
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            res.cookie("refresh_token", refresh_session.refresh_token, {
                httpOnly: true,
                secure: process.env.ENVIRONMENT === "PROD",
                sameSite: "strict",
                expires: expiresAt
            })
            return r.success(
                {
                    session_id: refresh_session.token
                }, 
                "Session Refreshed."
            )
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error(
                "An unexpected server error occurred during refresh session",
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    public logout = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const refreshToken = req.cookies.refresh_token;

        if(refreshToken){
            await Token.deleteOne({refresh_token: refreshToken});
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === "PROD",
            sameSite: "strict",
            expires: expiresAt
        });

        return r.success(null, "Account logged out successfully", StatusCodes.OK);
    }

    public SendOtp = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const username = req.user?.username;
        const account = await Account.findOne({username: username});

        if(!account)
            return r.error("Account isn't registered yet.", StatusCodes.NOT_FOUND);

        try{
            const send_email = await this.service.SendEmailVerification(account.email);
    
            if(!send_email)
                return r.error("Failed to verify your email.", StatusCodes.FORBIDDEN);

            return r.success(null, "Check your email for the otp");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("Failed to verify your email", StatusCodes.FORBIDDEN);
        }
    }


    public verifyOtp = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const otp = req.query.token as string;
        const username = req.user?.username;

        if(!otp)
            return r.error("Otp was not valid.", StatusCodes.BAD_REQUEST);

        try{
            const User = await Account.findOne({username: username});
            
            if(!User)
                return r.error("Failed to verify your email", StatusCodes.FORBIDDEN);

            const isVerified = await this.service.VerifyEmail(User._id, otp);

            if(!isVerified)
                return r.error("Failed to verify your email", StatusCodes.FORBIDDEN);

            return r.success("Email was verified succesfully!");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("Failed to verify your email", StatusCodes.FORBIDDEN);
        }
    }

    public getProfile = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const username = req.user?.username
        const User = await Account.findOne({username: username})

        if(!User)
            return r.error("Account isn't registered yet.", StatusCodes.NOT_FOUND);

        try{
            const data = await this.service.getProfile(User._id);
            
            if(!data)
                return r.error("Failed to Get your profile.", StatusCodes.FORBIDDEN);

            const dataDTO: Record<string, any> = {};

            for(const [key, val] of Object.entries(data)) {
                if(key !== "password")
                    dataDTO[key] = val;
            }

            return r.success(dataDTO, "Profile found.");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during process", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public updateProfile = async (req: Request, res: Response): Promise<Response> => {
        const r = new ApiResponse(res);
        try{
            const username = req.user?.username;
            const body: IAccountDTO = req.body;

            if(!username)
                return r.error("Failed to update your profile", StatusCodes.BAD_REQUEST);

            
            const User = await Account.findOne({username: username});
            
            if(!User || !User._id || !isValidObjectId(User._id))
                return r.error("Failed to update your profile", StatusCodes.BAD_REQUEST);

            const updated_profile = await this.service.updateProfile(User._id, body);

            if(!updated_profile)
                return r.error("there's some issues while updating your profile.", StatusCodes.BAD_REQUEST);

            return r.success("Success updating your profil.");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during the process", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}


const authenticationController = new AuthenticationController(authenticationServices);

export default authenticationController;