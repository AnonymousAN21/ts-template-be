import { model, Types, Schema } from "mongoose";
import { LECTURE, LECTUREPAGE } from "../../../../../constant/model_name.js";

const ContentBlockSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["text", "video", "audio", "image", "quiz"],
    },

    body: { type: String },
    media_url: { type: String },
    caption: { type: String },

    quiz_data: {
        question: { type: String },
        options: [{ type: String }],
        correct_answer: { type: String },
    },

    preferences: {
        delivery_mode: { 
            type: String, 
            enum: ["visual", "auditory", "textual"],
            default: "textual"
        },
        difficulty: { 
            type: String, 
            enum: ["beginner", "intermediate", "advanced"],
            default: "intermediate" 
        }
    }
}, { _id: true });

const LecturePageSchema = new Schema({
    lecture_code: {
        type: String,
        required: true
    },
    page_number:{
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: [ContentBlockSchema],
    metadata: {
        estimated_read_time: {
            type: Number
        },
        is_published: {
            type: Boolean,
            default: false
        }
    }
}, {timestamps: true})

LecturePageSchema.index({lecture_id: 1, page_number: 1}, { unique: true });

const LecturePage = model(LECTUREPAGE, LecturePageSchema);
export default LecturePage;