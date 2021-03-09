import { Schema, Types, model } from "mongoose";
import { ISupportChat, SupportProblemArray } from "../types/models";

const SupportChatSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [
        {
            isUser: {
                type: Boolean,
                required: true,
            },
            date: {
                type: Date,
                required: true,
            },
            content: {
                type: String,
                required: true,
            }

        }
    ],
    title: {
        type: String,
        required: true,
    },
    timestamp: Date,
    problem: {
        type: String,
        enum: SupportProblemArray,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    readByUser: {
        type: Boolean,
        required: true,
        default: true,
    },
    readByAdmin: {
        type: Boolean,
        required: true,
        default: true,
    },
    payload: {
        consultationId: String,
    }
});

export default model<ISupportChat>("SupportChat", SupportChatSchema);
