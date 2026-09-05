import bcrypt from "bcryptjs";
import Account from "../../../../config/database/mongodb/schema/account.model.js";
import Token from "../../../../config/database/mongodb/schema/additional.model/session.model.js";
import { IAccount, IAccountDTO, ISession } from "../../../../interfaces/account.interface.js";
import Show from "../../../../utils/error.handler.js";
import jwt from "jsonwebtoken"
import ApiError from "../../../../utils/app_error.handler.js";
import { StatusCodes as s, StatusCodes} from "http-status-codes";
import AuthEmailSender from "../../../../handler/email.handler.js";
import crypto from "crypto";
import { Verification } from "../../../../config/database/mongodb/schema/additional.model/verification.model.js";
import { Types } from "mongoose";
// Authentication Constant Declaration

const SALT = process.env.SALT;
const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;
class AuthenticationServices{

    constructor(){}

    private IsEnvLoaded(): boolean {
        if(!SALT || !SECRET_KEY || !SECRET_REFRESH_KEY){
            return false;
        } 
        return true;
    }

    public async create_account(data: IAccount): Promise<IAccountDTO | null>{
        if(!this.IsEnvLoaded()) return null;

        try{
            const IsExist = await Account.exists({
                $or: [
                    {email: data.email},
                    {username: data.username}
                ]
            })

            if(IsExist){
                Show({ text: "Username or Email already exist"});
                throw new ApiError("Username or Email already exist", s.CONFLICT);
            }

            const hash_password = await bcrypt.hash(data.password, parseInt(SALT!));

            const new_account = await Account.create({
                first_name: data.first_name,
                last_name: data.last_name,
                username: data.username,
                password: hash_password,
                email: data.email,
                about_me: data.about_me? data.about_me : ""
            })

            Show({text: `Success Creating new Account: ${data.first_name}`});
            return new_account as IAccountDTO
        }catch(error) {
            Show({
                error: error instanceof Error ? error : new Error(error as string),  
                text: `Failed while Creating new Account: ${data.first_name}`
            });
            throw new ApiError(`Failed while Creating new Account: ${data.first_name}`, s.INTERNAL_SERVER_ERROR);
        }
    }

    public async verify(data: {username?: string, email?: string, password?: string}, metadata: {user_agent: string, ip: string}): Promise<ISession | null>{
        if(!this.IsEnvLoaded()) return null;
        try{
            const IsExist = await Account.findOne({
                $or: [
                    {email: data.email},
                    {username: data.username}
                ]
            })

            if (!IsExist) {
                Show({ text: `Account with email/username: ${data.username? data.username : data.email}. can't be found`})
                throw new ApiError(`Account with email/username: ${data.username? data.username : data.email}. can't be found`, s.NOT_FOUND)
            }

            if (!data.password){
                throw new ApiError(`Password is Required!`, s.UNAUTHORIZED);
            }
            
            const AccountData = IsExist;
            const IsPasswordCorrect = await bcrypt.compare(data.password, AccountData.password)

            if (!IsPasswordCorrect) {
                Show({ text: `Failed to login into: ${data.username}, reason: Wrong Password`});
                throw new ApiError(`Failed to login into: ${data.username}, reason: Wrong Password`, s.UNAUTHORIZED)
            }

            const accessToken = jwt.sign({
                username: AccountData.username,
                first_name: AccountData.first_name,
                last_name: AccountData.last_name,
                email: AccountData.email,
                about_me: AccountData.about_me,
            }, SECRET_KEY!, {expiresIn: '1h'});

            const RefreshToken = jwt.sign({
                username: AccountData.username,
                email: AccountData.email
            }, SECRET_REFRESH_KEY!, {expiresIn: '30d'});
            
            const tokenExpiryTime = 30 * 24 * 60 * 60 * 1000;
            const expiresAt = new Date(Date.now() + tokenExpiryTime);

            await Token.create({
                account_id: AccountData._id,
                refresh_token: RefreshToken,
                device_info: metadata.user_agent,
                ip_address: metadata.ip,
                expires_at: expiresAt
            })

            return {
                token: accessToken,
                refresh_token: RefreshToken
            }
        }catch(error){
            Show({
                error: error instanceof Error ? error: new Error(error as string),
                text: `Failed to login into: ${data.username}` 
            })
            throw new ApiError(`Failed to login into: ${data.username}` , s.INTERNAL_SERVER_ERROR)
        }
    }

    public async refresh_session(data: {username?: string, email?: string}, metadata: {user_agent: string, ip: string}): Promise<ISession | null>{ 
        if(!this.IsEnvLoaded) return null;
        try{
            const isExist = await Account.findOne({
                $or:[
                    {email: data.email},
                    {username: data.username}
                ]
            })

            if(!isExist){
                Show({ text: `Account with email/username: ${data.username? data.username : data.email}. can't be found`})
                throw new ApiError(`Account with email/username: ${data.username? data.username : data.email}. can't be found`, s.NOT_FOUND)
            }

            const AccountData = isExist;

            const accessToken = jwt.sign({
                username: AccountData.username,
                first_name: AccountData.first_name,
                last_name: AccountData.last_name,
                email: AccountData.email,
                about_me: AccountData.about_me,
            }, SECRET_KEY!, {expiresIn: '1h'});

            const RefreshToken = jwt.sign({
                username: AccountData.username,
                email: AccountData.email
            }, SECRET_REFRESH_KEY!, {expiresIn: '30d'});
            
            const tokenExpiryTime = 30 * 24 * 60 * 60 * 1000;
            const expiresAt = new Date(Date.now() + tokenExpiryTime);

            await Token.create({
                account_id: AccountData._id,
                refresh_token: RefreshToken,
                device_info: metadata.user_agent,
                ip_address: metadata.ip,
                expires_at: expiresAt
            })

            return {
                token: accessToken,
                refresh_token: RefreshToken
            };
        }catch(error){
            Show({
                error: error instanceof Error ? error: new Error(error as string),
                text: `Failed to login into: ${data.username}` 
            })
            throw new ApiError(`Failed to login into: ${data.username}`, s.INTERNAL_SERVER_ERROR);
        }
    }

    public async SendEmailVerification(email: string) {
        try{
            if(!email)
                throw new ApiError("Email is not valid.", StatusCodes.UNPROCESSABLE_ENTITY);

            const isUserWithEmailExist = await Account.findOne({email: email});

            if(!isUserWithEmailExist)
                throw new ApiError("Email is not registered yet.", StatusCodes.NOT_FOUND);


            const otpCode = crypto.randomInt(100000, 999999).toString();

            const User = isUserWithEmailExist;

            await Verification.create({
                account_id: User._id,
                token: otpCode,
                createdAt: new Date(Date.now())
            });

            await AuthEmailSender.send_code(email, otpCode);

            return true;
        }catch(error){
            throw new ApiError("Failed to verified Email.", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async VerifyEmail(accountID: Types.ObjectId, Otp: string) {
        try{
            const isExist = Verification.findOne({
                account_id: accountID,
                token: Otp
            });

            if(!isExist)
                throw new ApiError("Otp is invalid, or Expired.", StatusCodes.FORBIDDEN);

            await Verification.deleteOne({
                account_id: accountID,
                token: Otp
            });

            await Account.findByIdAndUpdate(accountID, {
                $set: {
                    "status.email_verified": true
                }
            })

            return true;
        }catch(error){
            throw new ApiError("Otp is invalid, or Expired.", StatusCodes.FORBIDDEN);
        }
    }

    public async getProfile(accountID: Types.ObjectId): Promise<IAccountDTO> {
        try{
            const User = await Account.findById(accountID).lean();

            if(!User)
                throw new ApiError("Can't get your profile information, try refresh this site.", StatusCodes.NOT_FOUND);

            return User as IAccountDTO;
        }catch(error){
            throw new ApiError("Failed to get your profile information", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async updateProfile(accountID: Types.ObjectId, data: IAccountDTO): Promise<IAccountDTO> {
        try{
            const isExist = await Account.exists(accountID);

            if(!isExist)
                throw new ApiError("Account can't be found.", StatusCodes.NOT_FOUND);

            const UpdatedAccount = await Account.updateOne({_id: accountID}, {
                $set :{
                    ...data
                }
            })

            if(!UpdatedAccount)
                throw new ApiError("Failed to Update your account information.", StatusCodes.BAD_REQUEST);

            return UpdatedAccount as IAccountDTO;
        }catch(error){
            throw new ApiError("Failed to update your account information.", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async getAccountIdByUsername(username: string): Promise<Types.ObjectId>{
        try{
            const account = await Account.findOne({username: username});
            
            if(!account)
                throw new ApiError("Failed to find account", StatusCodes.NOT_FOUND);

            return account._id;
        }catch{
            throw new ApiError("Failed to find account", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

const authenticationServices = new AuthenticationServices();
export default authenticationServices;