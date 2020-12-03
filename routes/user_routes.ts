// Todo: resize uploaded image

import express from "express";
import rateLimitter from "express-rate-limit";
import crypto from "crypto";
import path from "path";
import jwt from "jsonwebtoken";
import multer from "multer";
import userServices from "../services/user_services";
import mail_services from "../services/mail_services";
import logger from "../logger";
import User from '../models/user';
import fs from "fs";
import Ajv from "ajv";

// @types
import { UserObject } from "../types/models";
import { ServerError } from "../types/errors";
import token_services from "../services/token_services";
import Doctor from "../models/doctor";

// Used to process the http request
const Router = express.Router();

// Used to validate image type
const availableImageMimetype = ["image/png", "image/jpeg", "image/jpg"];

// User Profile image storage
const storage = multer.diskStorage({
    destination: (req, file, callback) =>
        callback(null, "./static/user-profiles"),
    filename: (req, file, callback) => {
        // Generate filename
        let customFileName = crypto.randomBytes(18).toString("hex");
        let fileExtension = path.extname(file.originalname).split(".")[1];
        console.log(`${customFileName}.${fileExtension}`);

        callback(null, `${customFileName}.${fileExtension}`);
    },
});

// User Profile image filter
const fileFilter = (req: any, file: any, callback: any) => {
    if (availableImageMimetype.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

// Upload user profiles
const upload = multer({
    storage,
    limits: {
        fileSize: 7340032,
    },
    fileFilter,
});

// ANCHOR: generate token
/**
 * Generate and returh token for received user id
 */
// export const generateToken = (id: string, key: string): string => {
//     return jwt.sign(
//         {
//             id,
//         },
//         process.env[key] ?? "",
//         {
//             expiresIn: "30m",
//         }
//     );
// };


// ANCHOR: generate-token
// Limit request
const generateTokenLimitter = rateLimitter({
    windowMs: 10 * 60 * 1000,
    max: 3, // 3 per 10 min
});
/**
 *  This function generate new access & refresh token
 */
Router.post("/generate-token", generateTokenLimitter, async (req, res) => {
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
});

// ANCHOR: login-user
// Limit request
const loginTokenLimiter = rateLimitter({
    windowMs: 10 * 60 * 1000,
    max: 10, // 10 per 10 min
});
/**
 *  This function check user received email & password
 */
Router.post("/login-user", loginTokenLimiter, async (req, res) => {
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

    console.log(password);

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
});

// ANCHOR: send-reset-password-email
// Limit request
const resetPasswordEmailLimitter = rateLimitter({
    windowMs: 10 * 60 * 1000,
    max: 10, // 10 per 10 min
});
/**
 * This function send reset email with reset password link
 */
// Router.post(
//     "/send-reset-password-email",
//     resetPasswordEmailLimitter,
//     async (req, res) => {
//         const email = req.body.email;

//         await userServices.sendResetPasswordMail(email);

//         res.status(200).json({ success: true });
//     }
// );

// ANCHOR: Refresh token
// Limit request
const tokenLimitter = rateLimitter({
    windowMs: 10 * 60 * 1000,
    max: 5, // 5 per 10 min
});

/**
 * This function generate new access & refresh token by receiver refresh token
 */
Router.post("/token", async (req, res) => {
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
});

// ANCHOR: Get all users
// Limit request
const getUsersLimitter = rateLimitter({
    windowMs: 1 * 60 * 1000,
    max: 100, // 100 per 1 minute
});
/**
 * This function get all existings users
 * defaultAmount = 50
 */
Router.get("/users", getUsersLimitter, async (req, res) => {
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
});

// ANCHOR: get user
// Limit request
const getUserLimitter = rateLimitter({
    windowMs: 1 * 60 * 1000,
    max: 100, // 100 per 1 minute
});
/**
 *  Get user by received id
 */
Router.get("/user/:id", getUserLimitter, token_services.authenticateToken, async (req, res, next) => {
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
});

interface FileRequest extends Request {
    files: any;
    params: {
        id: string
    }
}

// ANCHOR: set user avatar
// Limit request
const setUserAvatarLimitter = rateLimitter({
    windowMs: 1 * 60 * 1000,
    max: 100, // 100 per 1 minute
});
/**
 *  This function upload resized photo to storage and update photo url field in user model
 */
Router.post(
    "/user/setAvatar/:id",
    setUserAvatarLimitter,
    token_services.authenticateToken,
    // @ts-ignore
    async (req: FileRequest, res) => {

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
);

// ANCHOR: Create
/**
 * This function push received user to db
 */
Router.post("/user", async (req, res) => {
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
});

// ANCHOR: Update user
/**
 * This function receiver user
 */
Router.put("/user/:id", async (req, res, next) => {
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
});

// ANCHOR: delete user
/**
 * This function delete received user
 */
Router.delete("/user/:id", async (req, res, next) => {
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
});

// ANCHOR: resetPassword
Router.post("/reset-password", async (req, res) => {
    const { requestId, password } = req.body;

    if (!requestId || !password) {
        return res.status(400).json({
            success: false,
            error: "required_error",
        });
    }

    const response = await userServices.resetPassword(requestId, password);

    return res.status(response.success ? 201 : 400).json(response);
});

Router.post("/send-reset-password-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: "required_error",
        });
    }

    const response = await mail_services.sendResetPasswordMail(email);

    return res.status(response.success ? 200 : 400).json(response);
});

Router.get("/user/:id/reviews", async (req, res) => {

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

});


export default Router;
