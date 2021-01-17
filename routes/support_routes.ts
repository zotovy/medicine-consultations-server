import { Router as ExpressRouter } from "express";
import UserServices from "../services/user_services";
import IRouteHandler, { BaseRouter } from "../types/routes";
import logger from "../logger";
import Joi from "joi";
import SupportServices from "../services/support_services";
import tokenServices from "../services/token_services";

export default class HelperRoutes implements BaseRouter {

    router: ExpressRouter;

    constructor() {
        const Router = ExpressRouter();
        Router.post("/create-chat", tokenServices.authenticateToken, HelperRoutes.createChat);
        this.router = Router;
    }

    private static createChat: IRouteHandler = async (req, res) => {
        const schema = Joi.object({
            title: Joi.string().min(8).max(1024).required(),
            message: Joi.string().min(1).max(4086).required(),
        });

        const validate = schema.validate(req.body);
        if (validate.error) {
            logger.w("HelperRoutes.sendMessage: validation body error", validate.error);
            return res.status(400).json({ success: false, error: "validation_error" });
        } else if (!await UserServices.exists(req.headers.userId as string).catch(() => false)) {
            logger.w("HelperRoutes.sendMessage: user not found with id =", req.headers.userId );
            return res.status(400).json({ success: false, error: "validation_error" });
        }

        const { title, message } = validate.value;
        const uid = req.headers.userId as string;
        const response = await SupportServices.createChat(uid, title, message)
            .then(uid => ({ success: true, uid }))
            .catch(e => {
               logger.e("HelperRoutes.createChat: error happened ", e);
               return { success: false, error: e };
            });

        return res.status(response.success ? 201 : 500).json(response);
    };
}