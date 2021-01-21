import { Router as ExpressRouter } from "express";
import UserServices from "../services/user_services";
import IRouteHandler, { BaseRouter } from "../types/routes";
import { Logger } from "../logger";
import Joi from "joi";
import SupportServices from "../services/support_services";
import tokenServices from "../services/token_services";
import RoutesHelper from "../helpers/routes_helper";
import { Schema  } from "mongoose";
import ValidationHelper from "../helpers/validation_helper";
import { SupportProblemArray } from "../types/models";

const _logger = new Logger("SupportRoutes:");

export default class SupportRoutes implements BaseRouter {

    router: ExpressRouter;

    constructor() {
        const Router = ExpressRouter();
        Router.post("/support/create-chat", tokenServices.authenticateToken, SupportRoutes.createChat);
        Router.get("/user/support-questions", tokenServices.authenticateToken, SupportRoutes.getQuestions(true));
        Router.get("/doctor/support-questions", tokenServices.authenticateToken, SupportRoutes.getQuestions(false));
        Router.get("/user/support-questions/:id", tokenServices.authenticateToken, SupportRoutes.getQuestionById(true));
        Router.get("/doctor/support-questions/:id", tokenServices.authenticateToken, SupportRoutes.getQuestionById(false));
        Router.post("/user/support-questions/:id/send-message", tokenServices.authenticateToken, SupportRoutes.sendMessageByUser);
        Router.post("/doctor/support-questions/:id/send-message", tokenServices.authenticateToken, SupportRoutes.sendMessageByUser);
        this.router = Router;
    }

    private static createChat: IRouteHandler = async (req, res) => {
        const schema = Joi.object({
            title: Joi.string().min(8).max(1024).required(),
            message: Joi.string().min(1).max(4086).required(),
            isUser: Joi.boolean().default(true),
            problem: Joi.string().equal(...SupportProblemArray).required(),
        });

        const validate = schema.validate(req.body);
        if (validate.error) {
            _logger.w("createChat validation body error", validate.error);
            return res.status(400).json({ success: false, error: "validation_error" });
        } else if (!await UserServices.exists(req.headers.userId as string).catch(() => false)) {
            _logger.w("createChat user not found with id =", req.headers.userId );
            return res.status(400).json({ success: false, error: "validation_error" });
        }

        const { title, message, isUser, problem } = validate.value;
        const uid = req.headers.userId as string;
        const response = await SupportServices.createChat(uid, isUser, title, message, problem)
            .then(number => ({ success: true, number }))
            .catch(e => {
                _logger.e("createChat error happened ", e);
               return { success: false, error: e };
            });

        return res.status(response.success ? 201 : 500).json(response);
    };

    private static getQuestions: (isUser: boolean) => IRouteHandler = (isUser: boolean) => async (req, res) => {
        const uid = req.headers.userId as string;
        let options: any = {};
        if (req.query.from) options.from = parseInt(req.query.from as string);
        if (req.query.amount) options.amount = parseInt(req.query.amount as string);
        if (req.query.limitMessages) options.limitMessages = parseInt(req.query.limitMessages as string);

        let status = 200;
        const response = await SupportServices.getQuestions(uid, isUser, options)
            .then(questions => ({ success: true, questions }))
            .catch(e => {
                status = RoutesHelper.getStatus({ 404: ["no_user_found"] }, e);
                _logger.e("getQuestions error happened ", e);
                return { success: false, error: e };
            });

        return res.status(status).json(response);
    }

    private static getQuestionById: (isUser: boolean) => IRouteHandler = (isUser: boolean) => async (req, res) => {
        const uid = req.headers.userId as string;
        const { id } = req.params;
        let options: any = {};
        if (req.query.limitMessages) options.limitMessages = parseInt(req.query.limitMessages as string);

        // check giving id
        if (!ValidationHelper.checkId(id)) {
            _logger.w("getQuestionById – invalid ID:", id);
            return res.status(400).json({ success: false, error: "validation_error" });
        }

        let status = 200;
        const response = await SupportServices.getQuestion(uid, id, isUser, options)
            .then(question => ({ success: true, question }))
            .catch(e => {
                status = RoutesHelper.getStatus({ 404: ["no_user_found", "no_question_found"] }, e);
                _logger.e("getQuestion error happened ", e);
                return { success: false, error: e };
            });

        return res.status(status).json(response);
    }

    private static sendMessageByUser: IRouteHandler = async (req, res) => {
        const { message } = req.body;
        const { id } = req.params;

        // check giving id
        if (!ValidationHelper.checkId(id)) {
            _logger.w("sendMessageByUser – invalid ID:", id);
            return res.status(400).json({ success: false, error: "validation_error" });
        }

        // Check message
        if (!message || message.length == 0 || message.length > 2048) {
            _logger.e("sendMessageByUser – invalid message length, message =", message);
            return res.status(400).json({ success: false, error: "validation_error" });
        }

        // Check user access
        if (!await SupportServices.canUserAccessQuestion(req.headers.userId as string, id)) {
            _logger.w("sendMessageByUser – user ", req.headers.userId, "can't access question", id);
            return res.status(401).json({ success: false, error: "access_denied" });
        }

        // send message
        let status = 201;
        const response = await SupportServices.sendMessage(id, message)
            .then(() => ({ success: true }))
            .catch(e => {
                status = RoutesHelper.getStatus({ 404: ["no_question_found"] }, e);
                _logger.e("sendMessageByUser –", e);
                return { success: false, error: e };
            });

        return res.status(status).json(response);
    }
}