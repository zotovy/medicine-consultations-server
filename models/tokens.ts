import { Schema, model } from "mongoose";

const accessToken = new Schema({
    value: {
        type: String,
        required: true,
    },
});

const refreshToken = new Schema({
    value: {
        type: String,
        required: true,
    },
});

const adminAccessToken = new Schema({
    value: {
        type: String,
        required: true,
    },
});

const adminRefreshToken = new Schema({
    value: {
        type: String,
        required: true,
    },
});

export const AccessToken = model("AccessToken", accessToken);
export const RefreshToken = model("RefreshToken", refreshToken);
export const AdminAccessToken = model("AdminAccessToken", adminAccessToken);
export const AdminRefreshToken = model("AdminRefreshToken", adminRefreshToken);
