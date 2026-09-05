import { model, Schema, Types } from 'mongoose'
import { ACCOUNT } from '../../../../constant/model_name.js';

const AccountSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    about_me: {
        type: String,
        required: false
    },
    role: [
        {
            type: Types.ObjectId,
            ref: "role"
        }
    ],
    status: {
        email_verified: {
            type: Boolean,
            default: false,
            required: false
        },
        is_verified: {
            type: Boolean,
            default: false,
            required: false
        },
        is_ban: {
            type: Boolean,
            default: false,
            required: false
        }
    }
}, {
    timestamps: true
});

const Account = model(ACCOUNT, AccountSchema);

export default Account; 
