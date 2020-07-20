/// <reference path="../declaration/mongoose-extended-schema.d.ts" />

import { Types } from "mongoose";
import Doctor from "../models/doctor";

// types
import { DoctorObject, IDoctor, IUser } from "../types/models";

import {
    TValidateDoctor,
    TDoctorValidationErrors,
    TValidationErrorType,
    TSpeciality,
    TCreateDoctor,
    TUpdateDoctor,
} from "../types/services";

// Services
import UserServices from "./user_services";
import { IDoctorToDoctorObj } from "./types_services";

class DoctorServices {
    // ANCHOR: validate doctor
    validate = async (
        doctor: any,
        needUnique: boolean = true
    ): Promise<TValidateDoctor> => {
        // Doctor model is extended from User model,
        // so, if obj is not validate as user this will never validated as doctor
        const responce = await UserServices.validateUser(doctor, needUnique);

        if (!responce.success) {
            return {
                success: false,
                errors: responce.errors,
            };
        }

        let errors: TDoctorValidationErrors = {};
        const ErrorType = TValidationErrorType;

        // Speciality
        if (doctor.speciality !== undefined && doctor.speciality !== null) {
            if (!Array.isArray(doctor.speciality)) {
                errors.speciality = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.speciality.length; i++) {
                    if (
                        !Object.keys(TSpeciality).includes(doctor.speciality[i])
                    ) {
                        errors.speciality = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.speciality = ErrorType.RequiredError;

        // beginDoctorDate
        if (doctor.beginDoctorDate) {
            if (!(doctor.beginDoctorDate instanceof Date)) {
                errors.beginDoctorDate = ErrorType.TypeError;
            }
        } else errors.beginDoctorDate = ErrorType.RequiredError;

        // experience
        if (doctor.experience) {
            if (typeof doctor.experience !== "number") {
                errors.experience = ErrorType.TypeError;
            } else if (doctor.experience < 0) {
                errors.experience = ErrorType.TypeError;
            }
        } else errors.experience = ErrorType.RequiredError;

        // rating
        if (doctor.rating) {
            if (typeof doctor.rating !== "number") {
                errors.rating = ErrorType.TypeError;
            } else if (doctor.rating < 0 || doctor.rating > 5) {
                errors.rating = ErrorType.TypeError;
            }
        } else errors.rating = ErrorType.RequiredError;

        // whosFavourite
        if (doctor.whosFavourite) {
            if (!Array.isArray(doctor.whosFavourite)) {
                errors.whosFavourite = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.whosFavourite.length; i++) {
                    if (!Types.ObjectId.isValid(doctor.whosFavourite[i])) {
                        errors.whosFavourite = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.whosFavourite = ErrorType.RequiredError;

        // clientsReviews
        if (
            doctor.clientsReviews !== undefined &&
            doctor.clientsReviews !== null
        ) {
            if (!Array.isArray(doctor.clientsReviews)) {
                errors.clientsReviews = ErrorType.TypeError;
            }
        } else errors.clientsReviews = ErrorType.RequiredError;

        // clientConsultations
        if (
            doctor.clientsConsultations !== undefined &&
            doctor.clientsConsultations !== null
        ) {
            if (!Array.isArray(doctor.clientsConsultations)) {
                errors.clientsConsultations = ErrorType.TypeError;
            }
        } else errors.clientsConsultations = ErrorType.RequiredError;

        // sheldure
        if (doctor.sheldure) {
            if (!Array.isArray(doctor.sheldure)) {
                errors.sheldure = ErrorType.TypeError;
            }
        } else errors.sheldure = ErrorType.RequiredError;

        if (Object.keys(errors).length == 0) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                errors,
            };
        }
    };

    // ANCHOR: create doctor
    create = async (data: DoctorObject): Promise<TCreateDoctor> => {
        // validate doctor type
        const responce = await this.validate(data);

        if (!responce.success) {
            return {
                success: false,
                error: "not_validated_error",
                errors: responce.errors,
                message: "User is not validated",
            };
        }

        const doctor: IDoctor = new Doctor(data);

        if (!doctor) {
            console.log(`created doctor is null data = ${data}`);
            return {
                success: false,
                error: "created_doctor_is_null",
                message: "Created doctor is null",
            };
        }

        // save doctor to db
        await doctor.save();

        console.log(`successfully create doctor with id ${doctor._id}`);

        return {
            success: true,
            user: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: update doctor
    update = async (data: DoctorObject): Promise<TUpdateDoctor> => {
        const validation = await this.validate(data, false);

        if (!validation.success) {
            return {
                success: false,
                error: "not_validated_error",
                validationErrors: validation.errors,
                message: "Passing doctor object is not validated",
            };
        }

        try {
            const updated: IDoctor | null = await Doctor.findOneAndUpdate(
                { _id: data.id },
                data,
                { new: true }
            );

            if (!updated) {
                return {
                    success: false,
                    error: "updated_doctor_is_null",
                    message: `Updated user is null. User with id=${data.id} does not exist`,
                };
            }

            return {
                success: true,
                doctor: IDoctorToDoctorObj(updated),
            };
        } catch (e) {
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };
}

export default new DoctorServices();
