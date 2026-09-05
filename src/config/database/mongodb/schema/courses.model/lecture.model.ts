import { model, Schema, Types } from "mongoose";
import { LECTURE, LECTUREPAGE } from "../../../../../constant/model_name.js";

const LectureSchema = new Schema({
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
    page: [
        {
            type: Types.ObjectId,
            ref: LECTUREPAGE,
            default: null,
            required: false
        }
    ]
})

const Lecture = model(LECTURE, LectureSchema);
export default Lecture;