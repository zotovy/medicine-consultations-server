import mongoose, { Schema, model } from "mongoose";

// @types
import { IUser } from "../types/models";

const reqiredField = [true, "required_error"];
const uniqueField = [true, "unique_error"];

const UserSchema = new Schema({
    name: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length > 0, "length_error"],
    },
    surname: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length > 0, "length_error"],
    },
    // Отчество
    patronymic: {
        type: String,
    },
    fullName: {
        type: String,
        text: true,
    },
    photoUrl: {
        type: String,
    },
    phone: Number,
    email: {
        type: String,
        required: reqiredField,
        unique: uniqueField
    },
    password: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length >= 6, "length_error"],
    },
    age: Number,
    sex: {
        type: Boolean,
        required: reqiredField,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    consultations: {
        type: [ // Consultations which already have gone
            {
                // Store Array<ObjectId> of consultations
                // We can get user with consultation running .populate("consultation")
                type: Schema.Types.ObjectId,
                ref: "Consultation",
            },
        ],
        required: true,
        default: []
    },
    reviews: {
        type:  [
            {
                // Store Array<ObjectId> of reviews
                // We can get user with reviews running .populate("review")
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        required: true,
        default: []
    },
    notificationEmail: {
        type: String,
        unique: true,
        required: true,
    },
    sendNotificationToEmail: {
        type: Boolean,
        required: true,
    },
    sendMailingsToEmail: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date(),
    },
    lastActiveAt: {
        type: Date,
        required: true,
    },
    // List of favourites doctors
    favourites: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Doctor",
            },
        ],
        required: true,
        default: [],
    },
    activeConsultations: {
        type:  [ // Consultation which is going now and in the future
            {
                type: Schema.Types.ObjectId,
                ref: "Consultation",
            },
        ],
        required: true,
        default: [],
    },
    birthday: Date,
    chatsWithHelpers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "SupportChat"
            }
        ],
        required: true,
        default: [],
    },
    schedule: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Appointment",
            required: true,
            default: [],
        },
    ],
    consultationRequests: [
        {
            type: mongoose.Types.ObjectId,
            ref: "ConsultationRequest",
            required: true,
        }
    ],
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    history: [
        {
            type: mongoose.Types.ObjectId,
            ref: "TransactionModel",
            required: true,
            default: [],
        },
    ],
});

export default model<IUser>("User", UserSchema);
