import { model, Schema, Types } from "mongoose";
import { LECTURE, ROLE } from "../../../../constant/model_name.js";

const AccessabilitySchema = new Schema({
    lecture_allowed: [
        {
            type: Types.ObjectId,
            ref: LECTURE,
            required: true
        }
    ],
    allowed_task: [
        {
            type: String,
            default: "READ",
            enum: ["READ", "UPDATE", "DELETE"]
        }
    ] 
})

const RoleSchema = new Schema({
    created_by: {
        type: String,
        required: true
    },
    course_id: {
        type: String,
        required: true
    },
    role_name: {
        type: String,
        required: true
    },
    accessability: AccessabilitySchema
})

const Role = model(ROLE, RoleSchema);
export default Role;