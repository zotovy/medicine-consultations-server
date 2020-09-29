import Ajv from "ajv";
import User from "../models/user";
import Doctor from "../models/doctor";
import Consultation from "../models/consultation";
import { ConsultationObject, IConsultation } from "../types/models";
import { ConsultationValidationSchema } from "../types/services";
import { IConsultationToConsultationObj } from "./types_services";
import user_services from "./user_services";
import { Types } from "mongoose";
import consultation from "../models/consultation";

const throwInvalidError = (): { _id: any } => {
    throw "invalid_error";
};

class ConsultationServices {
    create = async (raw: any): Promise<string> => {
        // if date is instanse of Date --> convert to iso date
        if (raw.date && raw.date instanceof Date)
            raw.date = raw.date.toISOString();

        // validate received raw data
        const ajv = new Ajv({ allErrors: true });
        const valid = ajv.validate(ConsultationValidationSchema, raw);
        if (!valid) {
            const errors = ajv.errors?.map(
                (e) => `${e.dataPath.substring(1)}_${e.keyword}_error`
            );
            throw errors;
        }

        // create consultation
        const { _id } = await Consultation.create(raw).catch(throwInvalidError);
        return String(_id);
    };

    connect = async (
        consultationId: string,
        userId: string,
        isUser: boolean
    ): Promise<boolean> => {
        // Check is consultationId correct
        const consultation = await Consultation.findById(consultationId)
            .select("date -_id")
            .exec();

        // Throw error if no Consultation was found
        if (!consultation) throw "no_consultation_found_error";

        const delta =
            consultation.date.getUTCSeconds() - new Date().getUTCSeconds();

        if (delta > 0 || delta > 10800) throw "time_error";

        if (isUser) {
            // Add ref to this consultation to user
            await User.updateOne(
                { _id: userId },
                {
                    $addToSet: {
                        activeConsultations: [Types.ObjectId(userId)],
                    },
                },
                (_, raw) => {
                    if ((raw.nModified ?? 0) == 0) {
                        throw "no_user_found_error";
                    }
                }
            );
        } else {
            // Add ref to this consultation to doctor
            await Doctor.updateOne(
                { _id: userId },
                {
                    $addToSet: {
                        activeConsultations: [Types.ObjectId(userId)],
                    },
                },
                (_, raw) => {
                    if ((raw.nModified ?? 0) === 0) {
                        throw "no_user_found_error";
                    }
                }
            );
        }

        return true;
    };
}

export default new ConsultationServices();
