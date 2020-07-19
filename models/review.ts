import { Schema, model } from "mongoose";
import { IReview } from "../types/models";

const Review = new Schema({
    patientId: {
        type: String,
        required: true,
    },
    doctorId: {
        type: String,
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
