import { Schema, Types, model } from "mongoose";
import { ISupportChat } from "../types/models";

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
});

export default model<ISupportChat>("SupportChat", SupportChatSchema);