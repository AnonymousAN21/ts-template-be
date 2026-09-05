import { StatusCodes } from "http-status-codes";
import { ISubLecture, ISubLectureContentBlock } from "../../../../../interfaces/lecture.interface.js";
import ApiError from "../../../../../utils/app_error.handler.js";

class SubLectureServices{
    public createLecture(data: ISubLecture): Promise<ISubLecture>{
        try{
            
        }catch{
            throw new ApiError("Failed to create new lecture", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}