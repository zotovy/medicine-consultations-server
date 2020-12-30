import Joi from "joi";

export default class ValidationHelper {

    public static customTimeSchema = Joi.object({
        h: Joi.number().integer().min(0).max(23).required(),
        m: Joi.number().integer().min(0).max(59).required(),
    });

}

