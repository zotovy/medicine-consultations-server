import { Schema, model } from "mongoose";

const refreshToken = new Schema({
    value: {
        type: String,
        required: true,
    },
});

export const RefreshToken = model("RefreshToken", refreshToken);
