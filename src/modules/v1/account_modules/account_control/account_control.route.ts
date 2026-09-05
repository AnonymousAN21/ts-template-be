import { Router } from "express";
import accountController from "./account_control.controller.js";
import { Authenticate } from "../../../../middlewares/middleware.js";

class AccountControlRouter{
    public router: Router
    private controller: typeof accountController;

    constructor(controller: typeof accountController){
        this.router = Router();
        this.controller = controller;
        this.routes()
    }

    private routes(): void{
        this.router.get("/get-all", Authenticate(), this.controller.GetAll);
        this.router.get("/get/:id", Authenticate(), this.controller.GetById);
    }
}

const AccountControlRoute = new AccountControlRouter(accountController);
export default AccountControlRoute;