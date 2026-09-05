import { Router } from "express";
import courseController from "./course.controller.js";
import { Authenticate } from "../../../../middlewares/auth.middleware.js";

class CourseRoute{
    public router: Router;
    private controller: typeof courseController;

    constructor(controller: typeof courseController){
        this.router = Router();
        this.controller = controller;
        this.routes();
    }

    private routes(): void{
        this.router.post("/create", Authenticate(["VERIFIED_PROFESSOR"]))
    }
}