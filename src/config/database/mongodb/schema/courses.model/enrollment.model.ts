import { Types, model, Schema } from "mongoose";
import { ACCOUNT, COURSE, ENROLLMENT } from "../../../../../constant/model_name.js";

const EnrollemntSchema = new Schema({
    course_id: {
        type: Types.ObjectId,
        ref: COURSE
    },
    account_id: {
        type: Types.ObjectId,
        ref: ACCOUNT
    }
}, {timestamps: true});

const Enrollment = model(ENROLLMENT, EnrollemntSchema);

export default Enrollment;