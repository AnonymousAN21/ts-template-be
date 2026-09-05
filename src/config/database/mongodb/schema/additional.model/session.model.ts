import { model, Schema } from "mongoose";

const TokenSchema = new Schema({
    account_id: {
        type: Schema.Types.ObjectId,
        ref: "account",
        required: true
    },
    refresh_token: {
        type: String,
        required: true,
        unique: true
    },
    device_info: {
        type: String,
        default: "Unknown Device"
    },
    ip_address: {
        type: String
    },
    is_revoked: {
        type: Boolean,
        default: false
    },
    expires_at: {
        type: Date,
        required: true
    }
}, { timestamps: true });

TokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

TokenSchema.index({ account_id: 1 });

const Token = model("token", TokenSchema);
export default Token;