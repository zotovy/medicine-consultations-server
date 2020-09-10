import { Schema, model, Types } from "mongoose";
import { IReview } from "../types/models";

const Review = new Schema({
    patientId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctorId: {
        type: Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    point: {
        type: Number, // from 0 to 5
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
});

export default model<IReview>("Review", Review);
