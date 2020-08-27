import { Schema, model } from "mongoose";

const MailBlocksSchema = new Schema({
    email: String,
});

const ResetPasswordRequestSchema = new Schema({
    userId: String,
    timestamp: Date,
});

export const MailBlocks = model("MailBlocks", MailBlocksSchema);
export const ResetPasswordRequest = model(
    "ResetPasswordRequest",
    ResetPasswordRequestSchema
);
