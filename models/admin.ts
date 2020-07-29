import { Schema, model } from "mongoose";
import { IAdmin } from "../types/models";

const Admin = new Schema({
    name: String,
    username: String,
    password: String,
    role: String,
    lastActive: Date,
    photoUrl: String,
    email: String,
});

export default model<IAdmin>("Admin", Admin);
