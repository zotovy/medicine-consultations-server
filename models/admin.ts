import { Schema, model } from "mongoose";
import { IAdmin, IAdminHistory } from "../types/models";

const Admin = new Schema({
    name: String,
    username: String,
    password: String,
    role: String,
    lastActive: Date,
    photoUrl: String,
    email: String,
});

const AdminHistorySchema = new Schema({
    adminId: String,
    whatDid: String,
    payload: String, // JSON.stringify js object
    timestamp: Date,
});

export default model<IAdmin>("Admin", Admin);

export const AdminHistory = model<IAdminHistory>(
    "AdminHistory",
    AdminHistorySchema
);
