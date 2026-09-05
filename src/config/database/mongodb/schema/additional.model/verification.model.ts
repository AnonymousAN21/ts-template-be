import {model, Types, Schema} from "mongoose";

const VerificationSchema = new Schema({
    account_id: {
        type: Types.ObjectId,
        ref: "Account",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 
    }
})

export const Verification = model("verification", VerificationSchema);