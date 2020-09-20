import { Schema, Types, model } from "mongoose";
import { IConsPayment } from "../types/models";

const ConsultationPaymentSchema = new Schema({
    status: {
        type: String,
        default: "waiting",
        required: true,
    },
    consultationId: {
        type: Types.ObjectId,
        ref: "Consultation",
    },
    doctorId: {
        type: Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    info: String,
    createdAt: {
        type: Date,
        required: true,
    },
    payAt: Date,
    canceledAt: Date,
});

export default model<IConsPayment>(
    "ConsultationPayment",
    ConsultationPaymentSchema
);
