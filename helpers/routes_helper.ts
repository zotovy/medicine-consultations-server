import { Response } from "express";
import logger, { Logger } from "../logger";
import Joi from "joi";
import IRouteHandler from "../types/routes";
import ValidationHelper from "./validation_helper";

export default class RoutesHelper {

    private static defaultValidationResponse = { success: false, error: "not_validated" }

    public static JoiValidator = (
        res: Response,
        schema: Joi.AnySchema,
        data: any,
        position: string,
        responseJson = RoutesHelper.defaultValidationResponse,
        responseStatus = 404): boolean => {
            const validate = schema.validate(data);
            if (validate.error) {
                logger.i(`${position}: failed to validate`, validate.error);
                res.status(responseStatus).json(responseJson)
                return false;
            }
            return true;
    }

    public static getStatus = (schema: { [key: number]: string[]}, error: string, def = 500): number => {
        // @ts-ignore
        const keys: number[] = Object.keys(schema);
        for (let i = 0; i < keys.length; i++) {
            if (schema[keys[i]].includes(error)) return keys[i];
        }

        return def;
    }

    public static checkIdFromParams: (...keys: string[] ) => IRouteHandler = (...keys) => (req, res, next) => {
        const logger = new Logger("RoutesHelper.checkIdFromParams");
        for (const key in keys) {
            const id = req.params[key];
            if (!ValidationHelper.checkId(id)) {
                logger.w(`invalid ${key} ID:`, id);
                return res.status(400).json({ success: false, error: "validation_error" });
            }
        }
        return next();
    }

}