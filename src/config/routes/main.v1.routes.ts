import { Router } from "express";
import AccountRoute from "../../modules/v1/account_modules/authentication/account.route.js";
import AccountControlRoute from "../../modules/v1/account_modules/account_control/account_control.route.js";
class mainRouterv1{
    public router: Router;
    private account: typeof AccountRoute;
    private accountControl: typeof AccountControlRoute;

    constructor(){
        this.router = Router();
        this.account = AccountRoute;
        this.accountControl = AccountControlRoute;
        this.routes();
    }

    private routes(): void{
        this.router.use("/auth", this.account.router);
        this.router.use("/account", this.accountControl.router);
    }
}

export const MainRouterV1 = new mainRouterv1();