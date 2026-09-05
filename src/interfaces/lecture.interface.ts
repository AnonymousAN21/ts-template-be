import { Types } from "mongoose"

export interface ILecture{
    code: string,
    title: string,
    description: string
}

export interface ISubLectureContentBlock{
    type: ["text", "video", "audio", "image", "quiz"],
    body: string,
    media_url: string,
    caption: string,
    quiz_data: {
        question: string,
        options: string[],
        correct_answer: string
    },

    preferences: {
        delivery_mode: ["visual", "auditory", "textual"],
        difficulty: ["beginner", "intermediate", "advanced"]
    }
}

export interface ISubLecture<T>{
    lecture_id?: Types.ObjectId,
    page_number: number,
    title: string,
    content: T[],
    metadata: {
        estimated_read_time: number,
        is_published: boolean
    }
}