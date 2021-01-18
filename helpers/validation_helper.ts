import Joi from "joi";

export default class ValidationHelper {

    public static customTimeSchema = Joi.object({
        h: Joi.number().integer().min(0).max(23).required(),
        m: Joi.number().integer().min(0).max(59).required(),
    });

    public static checkId = (id: string): boolean => {
        const regex = new RegExp(/^[0-9a-fA-F]{24}$/);
        return regex.test(id);
    }

}

