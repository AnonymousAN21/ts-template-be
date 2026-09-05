import { Types } from "mongoose";
import { ILecture } from "./lecture.interface.js";

export interface ICourse{
    code?: string
    title: string
    description: string
    author: Types.ObjectId
    collabolators?: Types.ObjectId[]
    allowed_role?: Types.ObjectId[]
    lecture?: Types.ObjectId[];
    forum: Types.ObjectId
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICourseUpdate{
    title?: string,
    description?: string,
    allowed_role?: Types.ObjectId[]
}

export interface ICourseResponse{
    code?: string
    title?: string
    description?: string
    author?: Types.ObjectId
    collabolators?: Types.ObjectId[]
}

export interface ICourseFilterDTO{
    code?: string
    title?: string
    description?: string
    author?: Types.ObjectId
    collabolators?: Types.ObjectId[]
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICourseLecture{
    code?: string
    title: string
    description: string
    author: Types.ObjectId
    collabolators?: Types.ObjectId[]
    allowed_role?: Types.ObjectId[]
    lecture?: ILecture[];
    forum: Types.ObjectId
    createdAt?: Date;
    updatedAt?: Date;
}


export interface ICourseLectureDTO{
    code?: string
    title?: string
    description?: string
    author?: Types.ObjectId
    collabolators?: Types.ObjectId[]
    allowed_role?: Types.ObjectId[]
    lecture?: Types.ObjectId[];
    forum?: Types.ObjectId | null | undefined;
    createdAt?: Date;
    updatedAt?: Date;
}