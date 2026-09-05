import "dotenv/config"
import express, {Request, Response} from "express";
import Show from "./utils/error.handler.js";
import response from "./utils/response.handler.js";
import ConnectDB from "./config/database/connect.db.js";
import { MainRouterV1 } from "./config/routes/main.v1.routes.js";
import helmet from "helmet";
import cors from "cors"
import setRateLimit from "./middlewares/ratelimit.middleware.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// if behind reverse proxy if not commment it
app.set('trust proxy', 1);

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'QUERY', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
app.use(helmet())

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_TYPE = process.env.DATABASE_TYPE;

async function main(){

    if(DATABASE_TYPE === undefined || DATABASE_URL === undefined)
        return Show({
            error: new Error("the string from environment cant be loaded or set as Undefined."), 
            text: "Failed to load.", 
            ignore_env: true
        });

    await ConnectDB(DATABASE_TYPE, DATABASE_URL);
    
    app.use(setRateLimit(5 * 60 * 1000, 500, "Timeout Global timelimit hit."))
    app.get("/", (req:Request, res: Response) => {

        const r = new response(res);

        Show({text: "Server is Active!"});
        r.success([], "Server is Active!", 200);

    })
    
    app.use("/v1", MainRouterV1.router)

    app.listen(5000, () => {
        Show({text: "Server is running on port : 5000", ignore_env: true});
    })
}

main();