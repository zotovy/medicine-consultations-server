import Ajv from "ajv";
import Consultation from "../models/consultation";
import { ConsultationObject } from "../types/models";
import { ConsultationValidationSchema } from "../types/services";

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
        userId: string
    ): Promise<boolean> => {};
}

export default new ConsultationServices();
