import { model, Schema, Types } from "mongoose";
import { ACCOUNT, COURSE, FORUM, LECTURE, ROLE } from "../../../../../constant/model_name.js";

const CourseSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: Types.ObjectId,
        ref: ACCOUNT,
        required: true
    },
    collabolators: [
        {
            type: Types.ObjectId,
            ref: ACCOUNT,
            required: false
        }
    ],
    allowed_role: [
        {
            type: Types.ObjectId,
            ref: ROLE
        }
    ],
    lecture: [
        {
            type: Types.ObjectId,
            ref: LECTURE
        }
    ],
    forum: {
        type: Types.ObjectId,
        ref: FORUM
    }
}, {timestamps: true});

const Course = model(COURSE, CourseSchema);
export default Course;