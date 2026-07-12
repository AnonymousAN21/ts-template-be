import { Router } from "express";

class mainRouterv1{
    public router: Router;
    
    constructor(){
        this.router = Router();
        this.routes();
    }

    private routes(): void{

    }
}

export const MainRouterV1 = new mainRouterv1();