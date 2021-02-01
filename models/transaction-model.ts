import { Schema, model } from "mongoose";
import {
    ITransactionModel,
    PaymentMethod,
    TransactionDirection,
    TransactionStatus,
    TransactionType
} from "../types/models";


const TransactionModel = new Schema({
    direction: {
        type: String,
        required: true,
        enum: Object.keys(TransactionDirection),
    },
    date: {
        type: Date,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: Object.keys(PaymentMethod),
    },
    transactionType: {
        type: String,
        required: true,
        enum: Object.keys(TransactionType),
    },
    status: {
        type: String,
        required: true,
        enum: Object.keys(TransactionStatus)
    },
    amount: {
        type: Number,
        required: true,
    },
    bankDetails: {
        type: String,
        required: true,
    }
});

export default model<ITransactionModel>("TransactionModel", TransactionModel);