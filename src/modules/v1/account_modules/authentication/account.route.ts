import { Router } from "express";
import authenticationController from "./account.controller.js";
import { validate, setRateLimit, Authenticate, VerifySession } from "../../../../middlewares/middleware.js"
import { loginSchema, registerSchema } from "../../../../config/zod/account.zod.js";

class AccountRouter{
    public router: Router
    private controller: typeof authenticationController;

    constructor(controller: typeof authenticationController){
        this.router = Router();
        this.controller = controller;
        this.routes()
    }

    private routes(): void{
        this.router.post("/register", validate(registerSchema), this.controller.register);
        this.router.post("/login", validate(loginSchema), this.controller.login);
        this.router.post("/logout", this.controller.logout);
        this.router.post("/refresh", VerifySession(), this.controller.refresh_session);
        this.router.get("/profile", Authenticate(), this.controller.getProfile);
        this.router.get("/send-otp", Authenticate(), this.controller.SendOtp);
        this.router.get("/email-verify", Authenticate(), this.controller.verifyOtp);
        this.router.put("/profile", Authenticate(), this.controller.updateProfile);
    }
}

const AccountRoute = new AccountRouter(authenticationController);

export default AccountRoute;