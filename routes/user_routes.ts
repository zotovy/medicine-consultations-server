// Todo: resize uploaded image

import express, { Response } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import userServices from "../services/user_services";
import consultationServices from "../services/consultation_services";
import mail_services from "../services/mail_services";
import logger from "../logger";
import User from '../models/user';
import fs from "fs";

// @types
import { UserObject } from "../types/models";
import { ServerError } from "../types/errors";
import token_services from "../services/token_services";
import Doctor from "../models/doctor";
import IRouteHandler, { BaseRouter, FileRequest, IFileRouteHandler } from "../types/routes";
import Joi from "joi";
import RoutesHelper from "../helpers/routes_helper";
import { TGetAppointsServiceOptions } from "../types/services";


export default class UserRoutes implements BaseRouter {
    router: express.Router;

    constructor() {
        const router = express.Router();
        router.post("/generate-token", UserRoutes.generateToken);
        router.post("/login-user", UserRoutes.loginUser);
        router.post("/token", UserRoutes.updateToken);
        router.get("/users", UserRoutes.getUsers);
        router.get("/user/:id([a-fA-F0-9]{24})", token_services.authenticateToken, UserRoutes.getUser);
        router.post("/user/setAvatar/:id", token_services.authenticateToken, UserRoutes.setAvatar);
        router.post("/user", UserRoutes.createUser);
        router.post("/user", UserRoutes.createUser);
        router.put("/user/:id", UserRoutes.updateUser);
        router.delete("/user/:id", UserRoutes.deleteUser);
        router.post("/reset-password", UserRoutes.resetPassword);
        router.post("/send-reset-password-email", UserRoutes.sendResetPasswordEmail);
        router.get("/user/:id/reviews", UserRoutes.getReviews);
        router.post("/user/:id/update-password", token_services.authenticateToken, UserRoutes.updatePassword);
        router.get("/user/get-consultations-dates/:date", token_services.authenticateToken, UserRoutes.getConsultationsDatesByMonth(true));
        router.get("/user/:id/appoints", token_services.authenticateToken, UserRoutes.getAppoints(true));
        router.get("/user/:id/appoints-requests", token_services.authenticateToken, UserRoutes.getAppointsRequests(true));
        this.router = router;
    }

    private static generateToken: IRouteHandler = async (req, res) => {
        const id: string | undefined = req.body?.id;

        if (!id) {
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "No id found in body",
            });
        }

        const newAccessToken: string = jwt.sign(
            { id },
            process.env.jwt_access ?? ""
        );
        const newRefreshToken: string = jwt.sign(
            { id },
            process.env.jwt_refresh ?? ""
        );

        return res.status(200).json({
            success: true,
            tokens: {
                access: newAccessToken,
                refresh: newRefreshToken,
            },
        });
    }

    private static loginUser: IRouteHandler = async (req, res) => {
        const email: string | undefined = req.body.email;
        let password: string | undefined = req.body.password;

        if (!email || !password) {
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "No email or password found in body",
            });
        }

        password = await userServices.encryptPassword(password);

        const dbcode = await userServices.checkUserEmailAndPassword(
            email,
            password
        );

        if (!dbcode.success) {
            return res.status(202).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        const tokens = await userServices.generateNewTokens(dbcode.id ?? "");

        return res.status(200).json({
            success: true,
            id: dbcode.id,
            tokens,
            isUser: dbcode.isUser,
        });
    }

    private static updateToken: IRouteHandler = async (req, res) => {
        const accessToken = req.body?.accessToken;
        const refreshToken = req.body?.refreshToken;
        const userId = req.body?.userId;

        if (!accessToken || !refreshToken || !userId) {
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "No tokens or userId found in body",
            });
        }

        // const isOk =
        //     (await userServices.checkRefreshToken(userId, refreshToken)) &&
        //     (await userServices.checkAccessToken(userId, accessToken));

        const isOk = await userServices.checkRefreshToken(userId, refreshToken);

        if (!isOk) {
            return res.status(400).json({
                success: false,
                error: "invalid_token",
                message: "Token didn't verified",
            });
        }

        const tokens = await userServices.generateTokenAndDeleteOld(userId);

        return res.status(201).json({
            success: true,
            tokens,
        });
    }

    private static getUsers: IRouteHandler = async (req, res) => {
        const amount: number = req.body.amount ?? 50;
        const from: number = req.body.from ?? 0;

        try {
            // get users
            const dbcode = await userServices.getUsers(amount, from);

            // check users
            if (!dbcode.success) {
                return res.status(412).json({
                    success: false,
                    error: dbcode.error,
                    message: dbcode.message,
                });
            }

            return res.status(200).json({
                success: true,
                users: dbcode.users,
            });
        } catch (e) {
            throw new ServerError(e);
        }
    }

    private static getUser: IRouteHandler = async (req, res) => {
        // Get id from params
        const id = req.params.id;


        // no id found
        if (!id) {
            return res.status(412).json({
                success: false,
                error: "empty_params",
                message: "Id is required param but no id found",
            });
        }

        try {
            // get user
            const dbcode = await userServices.getUserById(id);

            // check user
            if (!dbcode.success) {
                return res.status(404).json({
                    success: false,
                    error: dbcode.error,
                    message: dbcode.message,
                });
            }

            // return user
            return res.status(200).json({
                success: true,
                user: dbcode.user,
            });
        } catch (e) {
            logger.e(e, e.stack);
            throw new ServerError(e);
        }
    }

    private static setAvatar: IFileRouteHandler = async (req: FileRequest, res: Response) => {

        const userId = req.params.id;

        if (!userId) {
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "No userId found in body",
            });
        }

        if (!req.files || Object.keys(req.files).length !== 1) {
            return res.status(400).json({ success: true, error: "no_files_found" });
        }

        try {
            const filename = Math.random().toString(36).substring(2, 15)
                + Math.random().toString(36).substring(2, 15) + ".jpg";
            req.files["1"].mv(path.join(__dirname, "../static/user-pics", filename));


            const user = await User.findById(userId).select("photoUrl");
            if (!user) return res.status(400).json({ status: false, error: "no_user_found" });
            const oldImagePath = path.join(__dirname, "../", user.photoUrl.substring(22));
            user.photoUrl = process.env.server_url + "/static/user-pics/" + filename
            fs.unlink(oldImagePath, () => {
            });
            await user.save();
            return res.status(200).json({
                success: true,
                photoUrlPath: process.env.server_url + "/static/user-pics/" + filename
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ success: false, error: "invalid_error" });
        }

    }

    private static createUser: IRouteHandler = async (req, res) => {
        // Get user from request body
        const user: UserObject = req.body;

        // Convert String Date ---> Date
        user.createdAt = new Date(user.createdAt);
        user.lastActiveAt = new Date(user.lastActiveAt);

        // no body
        if (!user || Object.keys(user).length === 0) {
            logger.w("body is null");
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "No user found in body",
            });
        }

        // Validate user
        const isValidated = await userServices.validateUser(user);

        if (!isValidated.success) {
            logger.w("user is not validated");
            return res.status(400).json({
                success: false,
                error: "not_validated_error",
                errors: isValidated.errors,
                message: "User is not validated",
            });
        }

        try {
            // Create user
            const dbcode = await userServices.createUser(user);

            // Check created user
            if (!dbcode.success) {
                return res.status(501).json({
                    success: false,
                    error: dbcode.error,
                    message: dbcode.message,
                });
            }

            const tokens = await userServices.generateNewTokens(
                dbcode.user?.id ?? ""
            );

            await mail_services.sendResetPasswordMail(dbcode.user?.id ?? "");

            return res.status(201).json({
                success: true,
                user: dbcode.user,
                tokens,
            });
        } catch (e) {
            logger.e(e, e.trace);
            throw new ServerError(e);
        }
    }

    private static updateUser: IRouteHandler = async (req, res) => {
        // Get user id from params
        const id = req.params.id;

        // no id
        if (!id) {
            return res.status(412).json({
                success: false,
                error: "empty_params",
                message: "User is required param but no id found",
            });
        }

        // Get new user from request body
        const newUser: UserObject = req.body;

        // Check new user
        if (!newUser) {
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "User is required body but no newUser found",
            });
        }

        // Convert String Date ---> Date
        if (newUser.birthday) newUser.birthday = new Date(newUser.birthday);

        try {
            const dbcode = await userServices.updateUser(newUser);

            // check action
            if (!dbcode.success) {
                return res.status(500).json({
                    success: false,
                    error: dbcode.error,
                    message: dbcode.message,
                    errors: dbcode.validationErrors,
                });
            }

            return res.status(200).json({
                success: true,
                user: dbcode.user,
            });
        } catch (e) {
            logger.e(e, e.trace);
            throw new ServerError(e);
        }
    }

    private static deleteUser: IRouteHandler = async (req, res) => {
        // get id from param
        const id = req.params.id;

        // no id
        if (!id) {
            return res.status(412).json({
                success: false,
                error: "empty_params",
                message: "User is required params but no id found",
            });
        }

        try {
            const dbcode = await userServices.removeUser(id);

            // check action
            if (!dbcode.success) {
                return res.status(500).json({
                    success: false,
                    error: dbcode.error,
                    message: dbcode.message,
                });
            }

            return res.status(200).json({
                success: true,
                user: dbcode.user,
            });
        } catch (e) {
            logger.e(e, e.trace);
            throw new ServerError(e);
        }
    }

    private static resetPassword: IRouteHandler = async (req, res) => {
        const { requestId, password } = req.body;

        if (!requestId || !password) {
            return res.status(400).json({
                success: false,
                error: "required_error",
            });
        }

        const response = await userServices.resetPassword(requestId, password);

        return res.status(response.success ? 201 : 400).json(response);
    }

    private static sendResetPasswordEmail: IRouteHandler = async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "required_error",
            });
        }

        const response = await mail_services.sendResetPasswordMail(email);

        return res.status(response.success ? 200 : 400).json(response);
    }

    private static getReviews: IRouteHandler = async (req, res) => {

        const { id } = req.params;
        const { tile, isUser } = req.query;


        const populate = tile == "true" ? [
            {
                path: "doctorId",
                select: "photoUrl fullName"
            }
        ] : [];

        try {
            const reviews = isUser == "false"
                ? await Doctor.findById(id).select("reviews").populate({
                    path: "reviews",
                    populate,
                })
                : await User.findById(id).select("reviews").populate({
                    path: "reviews",
                    populate,
                });

            if (!reviews) {
                return res.status(400).json({ success: false, error: "no_found" });
            }

            return res.status(200).json({ success: true, reviews: reviews.reviews });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ success: false, error: "invalid_error" });
        }

    }

    private static updatePassword: IRouteHandler = async (req, res) => {
        const { oldPassword, newPassword, isUser } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ status: false, error: "no_password_in_body" })
        }

        const response = await userServices.updatePassword(req.params.id, oldPassword, newPassword, isUser)
            .then(() => ({ success: true }))
            .catch(e => {
                logger.e("userServices.updatePassword:", e);
                return ({ success: false, error: e });
            })

        return res.status(response.success ? 202 : 400).json(response);
    }

    public static getConsultationsDatesByMonth: (isUser: boolean ) => IRouteHandler = (isUser) => async (req, res) => {
        const schema = Joi.object({
            date: Joi.string().regex(new RegExp("^((0)[0-9])|((1)[0-2])(\\.)\\d{4}$")).required(), // 01.2021
        });

        const ok = RoutesHelper.JoiValidator(res, schema, req.params, "UserRoutes.getConsultationsDatesByMonth");
        if (!ok) return;

        const { date } = req.params;
        const id = req.headers.userId as string;
        const from = parseInt((req.query.from as string) ?? NaN);
        const amount = parseInt((req.query.amount as string) ?? NaN);

        let status = 200
        const response = await consultationServices.getUserConsultationsDates(id, isUser, { date, from, amount })
            .then((dates) => ({ success: true, dates }))
            .catch((error) => {
                status = 500;
                if (error === "no_user_found") status = 404;
                return { success: false, error };
            });
        return res.status(status).json(response);
    }

    public static getAppoints: (isUser: boolean) => IRouteHandler = (isUser) => async (req, res) => {
        const { id } = req.params;

        // validate id & body
        if ((id.length != 24 && id.length != 12) || id !== req.headers.userId) return res.status(403).json({
            status: false, error: "invalid_id"
        });

        // handle query params
        const validQueriesParams: (keyof TGetAppointsServiceOptions)[] = ["numericDate"];
        const options: TGetAppointsServiceOptions = {};
        validQueriesParams.forEach(e => {
            if (req.query[e]) options[e] = req.query[e] as string;
        });


        const response = await consultationServices.getAppoints(id, isUser, options)
            .then(v => ({ success: true, appoints: v }))
            .catch(e => {
                logger.e(`${isUser ? "userRoutes" : "doctorRoutes"}.getAppoints: `, e);
                return ({ success: true, error: e });
            });

        return res.status(response.success ? 200 : 500).json(response);
    }

    public static getAppointsRequests: (isUser: boolean) => IRouteHandler = (isUser) => async (req, res) => {
        const { id } = req.params;
        const detail = req.query.detail === "true";

        // validate id & body
        if ((id.length != 24 && id.length != 12) || id !== req.headers.userId) return res.status(403).json({
            status: false, error: "invalid_id"
        });

        const response = await consultationServices.getAppointsRequests(id, isUser, detail)
            .then((v) => ({ success: true, requests: v }))
            .catch(e => ({ success: false, error: e }));

        return res.status(response.success ? 200 : 500).json(response);
    }
}
