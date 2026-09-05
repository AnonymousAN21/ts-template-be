import { ICourse, ICourseFilterDTO, ICourseLecture, ICourseLectureDTO, ICourseResponse, ICourseUpdate } from "../../../../interfaces/course.interface.js";
import Course from "../../../../config/database/mongodb/schema/courses.model/course.model.js";
import Lecture from "../../../../config/database/mongodb/schema/courses.model/lecture.model.js";
import { ILecture, ISubLecture } from "../../../../interfaces/lecture.interface.js";
import ApiError from "../../../../utils/app_error.handler.js";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { IPaginationResult } from "../../../../interfaces/additional/request.wrapper.js";

class CourseServices {

    private async generateCourseCode(title: string): Promise<string>{
        const Char: string[] = title.trim().split(/\s+/);
        let CodeHead: string = "";

        for(let i = 0; i < Char.length; i++){
            CodeHead += Char[i][0].toUpperCase();
        }

        if (!CodeHead) CodeHead = "ISC";

        const newestCourse = await Course.findOne({
            code: new RegExp(`^${CodeHead}-`)
        }).sort({createdAt: -1});

        const unicode = newestCourse?.code;

        let nextNumber = 1;

        if(unicode){
            const parts = unicode.split('-');

            if(parts.length === 2){
                const lastNumber = parseInt(parts[1], 10);
                if(!isNaN(lastNumber)){
                    nextNumber = lastNumber + 1;
                }
            }
        }

        const paddedNumber = nextNumber.toString().padStart(3, "0");

        return `${CodeHead}-${paddedNumber}`;
    }

    private async generateLectureCode(courseCode: string): Promise<string>{
        const course = await Course.findOne({
            code: courseCode
        }).sort({createAt: -1});

        if(!course)
            throw new Error("couldn't find that specific course");

        const currentLectureCourse = course.lecture ? course.lecture.length : 0;
        const nextNumber = currentLectureCourse + 1;

        const paddedNumber = nextNumber.toString().padStart(2, "0");

        return `${courseCode}-${paddedNumber}`;
    }

    public async createCourse(data: ICourse): Promise<ICourse>{
        try{
            const courseCode = await this.generateCourseCode(data.title);

            data.code = courseCode;

            const newCourse = await Course.create(data);
            
            return newCourse as ICourse;
        }catch{
            throw new ApiError("Failed to create the new Course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async addLecture(data: ILecture[], courseCode: string): Promise<ICourseLecture>{
        try{ 
            const isCourseExist = await Course.exists({
                code: courseCode
            })

            if(!isCourseExist)
                throw new ApiError("Specific Course, didn't exist yet", StatusCodes.NOT_FOUND);

            const createdLectures = [];

            for(const lectureData of data){
                lectureData.code = await this.generateLectureCode(courseCode);
                const newLecture = await Lecture.create(lectureData);
                createdLectures.push(newLecture);
            }
            
            const lectureIds = createdLectures.map(lecture => lecture._id);

            const courseLecture = await Course.findOneAndUpdate({code: courseCode}, {
                    $addToSet:{
                        lecture: { $each: lectureIds }
                    }
                },
                {new : true}
            ).populate("lecture");

            if(!courseLecture)
                throw new ApiError("Failed to update the course with new lectures", StatusCodes.FORBIDDEN);

            return courseLecture as unknown as ICourseLecture;
        }catch{
            throw new ApiError("Failed to add new lecture to the Course", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async getAllCourses(filter: ICourseFilterDTO, limit: number = 5, page: number = 1): Promise<IPaginationResult<ICourseResponse>>{
        try{
            const skipIndex = (page - 1) * limit;
            const [courses, totalItems] = await Promise.all([
                Course.find(filter).skip(skipIndex).limit(limit),
                Course.countDocuments(filter)
            ])

            return {
                data: courses,
                meta: {
                    totalItems,
                    currentPage: page,
                    itemPerPage: limit,
                    totalPages: Math.ceil(totalItems / limit)
                }
            };
        }catch{
            throw new ApiError("Failed to get all of the Courses", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async getCourseByCode(courseCode: string): Promise<ICourseLectureDTO>{
        try{
            const course = await Course.findOne({code: courseCode}).populate("lecture");
            
            if(!course)
                throw new ApiError("Course with current id Not Found", StatusCodes.NOT_FOUND);

            return course;
        }catch{
            throw new ApiError("Failed to get Course with current id", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async updateCourse(courseCode: string, data: ICourseUpdate): Promise<ICourseResponse>{
        try{
            const course = await Course.findOneAndUpdate({code: courseCode},
                data
            );

            if(!course)
                throw new ApiError("Failed to Update Course with current id", StatusCodes.FORBIDDEN);

            return course;
        }catch{
            throw new ApiError("Failed to Update Course with current id", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    public async deleteCourse(courseCode: string): Promise<ICourseResponse>{
        try{
            const course = await Course.findOneAndDelete({code: courseCode});

            if(!course)
                throw new ApiError("Failed to Delete Course with current id", StatusCodes.FORBIDDEN);

            return course;
        }catch{
            throw new ApiError("Failed to Delete Course with current id", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

const courseServices = new CourseServices();
export default courseServices;