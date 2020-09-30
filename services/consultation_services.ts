import Ajv from "ajv";
import User from "../models/user";
import { Socket } from "socket.io";
import Doctor from "../models/doctor";
import Consultation from "../models/consultation";
import { ConsultationObject, IConsultation } from "../types/models";
import { ConsultationValidationSchema } from "../types/services";
import { IConsultationToConsultationObj } from "./types_services";
import user_services from "./user_services";
import { Types } from "mongoose";
import consultation from "../models/consultation";
import token_services from "./token_services";

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

    connect = async (socket: SocketIO.Socket): Promise<boolean> => {
        const {
            consultationId,
            userId,
            isUser,
            accessToken,
        } = socket.handshake.query;

        const ok = await token_services.checkToken(
            "jwt_access",
            userId,
            accessToken
        );
        if (!ok) throw "invalid_token";

        // Check is consultationId correct
        const consultation = await Consultation.findById(consultationId)
            .select("date -_id")
            .exec();

        // Throw error if no Consultation was found
        if (!consultation) throw "no_consultation_found_error";

        const delta = consultation.date.getTime() - new Date().getTime();

        console.log("delta", delta);

        if (delta > 0 || delta < -1.08e7) throw "time_error";

        if (isUser) {
            // Add ref to this consultation to user
            await User.updateOne(
                { _id: userId },
                {
                    $addToSet: {
                        activeConsultations: Types.ObjectId(userId),
                    },
                },
                (_, raw) => {
                    if ((raw.n ?? 0) == 0) {
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
                        activeConsultations: Types.ObjectId(userId),
                    },
                },
                (_, raw) => {
                    if ((raw.n ?? 0) === 0) {
                        throw "no_user_found_error";
                    }
                }
            );
        }

        return true;
    };
}

export default new ConsultationServices();
