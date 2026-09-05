import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../utils/app_error.handler.js";
import ApiResponse from "../../../../utils/response.handler.js";
import courseServices from "./course.services.js";
import { Request, Response } from "express";
import { ILecture } from "../../../../interfaces/lecture.interface.js";
import authenticationServices from "../../account_modules/authentication/account.services.js";
class CourseController{
    constructor(){

    }

    public create = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);
        const data = req.body;
        const authorUsername = req.user?.username as string;

        try{
            const authorID = await authenticationServices.getAccountIdByUsername(authorUsername)
            
            let collabolatorsList = []
            if(data.collabolators && data.collabolators > 0){
                for(const collabUsername in data.collabolators){
                    const collabId = await authenticationServices.getAccountIdByUsername(collabUsername);
                    if(collabId){
                        collabolatorsList.push(collabId)
                    }
                }
            }

            data.author = authorID;
            data.collabolators = collabolatorsList

            const newCourse = await courseServices.createCourse(data);

            if(!newCourse)
                return r.error("Failed to create Course", StatusCodes.BAD_REQUEST);

            return r.success(newCourse, "Course created successfully", StatusCodes.CREATED);
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during creating course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public getAll = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);

        const filter = req.query;
        const limit = parseInt(req.query.limit as string);
        const page = parseInt(req.query.page as string);

        try{
            const courses = await courseServices.getAllCourses(filter, limit, page);

            return r.successPagination(courses.data, courses.meta, "Success to fetch Courses");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during fetching courses", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public getByCode = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);

        const courseCode = req.params.id;

        try{
            const course = await courseServices.getCourseByCode(courseCode[0]);

            if(!course)
                return r.error("Course Not Found", StatusCodes.NOT_FOUND);

            return r.success(course, "Success to fetch Course");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during fetching course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public update = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);

        const courseCode = req.params.id;
        const data = req.body;

        try{
            const updatedCourse = await courseServices.updateCourse(courseCode[0], data);

            if(!updatedCourse)
                return r.error("Failed to Update Course", StatusCodes.BAD_REQUEST);

            return r.success(updatedCourse, "Success to update Course");
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during updating course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public delete = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);

        const courseCode = req.params.id;

        try{
            const updatedCourse = await courseServices.deleteCourse(courseCode[0]);

            if(!updatedCourse)
                return r.error("Failed to Delete Course", StatusCodes.FORBIDDEN);
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during deleting course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public addLecture = async (req: Request, res: Response) => {
        const r = new ApiResponse(res);

        const courseCode = req.params.id;
        const data: ILecture[] = req.body.lecture;
        
        try{
            const AddedLecture = await courseServices.addLecture(data, courseCode[0]);

            if(!AddedLecture)
                return r.error("Failed to add lecture to the course", StatusCodes.BAD_REQUEST);

            return r.success(AddedLecture, "Lecture added successfully", StatusCodes.CREATED);
        }catch(error){
            if(error instanceof ApiError){
                return r.error(error.message, error.statusCode);
            }

            return r.error("An unexpected server error occurred during adding lecture to course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

const courseController = new CourseController();
export default courseController;