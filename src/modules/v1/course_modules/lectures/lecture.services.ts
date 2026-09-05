import { StatusCodes } from "http-status-codes";
import Lecture from "../../../../config/database/mongodb/schema/courses.model/lecture.model.js";
import LecturePage from "../../../../config/database/mongodb/schema/courses.model/page.model.js";
import { ISubLecture, ISubLectureContentBlock, ILecture } from "../../../../interfaces/lecture.interface.js";
import ApiError from "../../../../utils/app_error.handler.js";

class LectureServices{
    constructor(){

    }

    public async addPageToLecture(LectureCode: string, data: ISubLecture<ISubLectureContentBlock>[]): Promise<ISubLecture<ISubLectureContentBlock>>{
        try{
            const AllPages = [];
            for(const page of data){
                const createPage = await LecturePage.create(page); 
                AllPages.push(createPage);
            }

            const lecturePages = AllPages.map(page => page._id);

            const SelectedLecture = await Lecture.updateOne({
                code: LectureCode,
            },{
                $addToSet:{
                    $each: {lecturePages}
                }
            })
            
            return createPage.toObject() as unknown as ISubLecture<ISubLectureContentBlock>;
        }catch{
            throw new ApiError("Failed to add new Pages into lecture", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async deleteLecture(LectureCode: string): Promise<ILecture>{
        try{
            const _Lecture = await Lecture.findOne({code: LectureCode});
            if(!_Lecture)
                throw new ApiError("Couldn't find any lecture with that specific code", StatusCodes.NOT_FOUND);

            const LecturePages = await LecturePage.findMany({lecture_id})
        }catch(error){
            throw new ApiError("Couldn't be ")
        }
    }

    public async updateLecture(LectureCode: string, data: ILecture): Promise<ILecture>{
        try{
            const isExist = await Lecture.exists({code: LectureCode});
            if(!isExist)
                throw new ApiError("Couldn't find any lecture with that specific code", StatusCodes.NOT_FOUND);

            const updateData = await Lecture.updateOne({code: LectureCode}, {
                $set: {
                    data
                }
            });

            if(!updateData)
                throw new ApiError("Failed to update lecture with that specific code", StatusCodes.FORBIDDEN);

            return updateData as unknown as ILecture;
        }catch(error){
            throw new ApiError("Couldn't find any lecture with that specific code", StatusCodes.NOT_FOUND);
        }
    }
}