import { Schema, model } from "mongoose";

// Type
import { ISpeciality } from "../types/models";

const speciality = new Schema({
    name: {
        type: String,
        required: true,
    },
});

export default model<ISpeciality>("Speciality", speciality);
