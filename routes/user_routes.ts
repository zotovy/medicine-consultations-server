// Todo: resize uploaded image

import express from "express";
import rateLimitter from "express-rate-limit";
import crypto from "crypto";
import path from "path";
import jwt from "jsonwebtoken";
import multer from "multer";
import userServices from "../services/user_services";
import mail_services from "../services/mail_services";
import tokenServices from "../services/token_services";
import logger from "../logger";

// @types
import { UserObject } from "../types/models";
import { ServerError } from "../types/errors";

// get secret keys to crypt/encrypt tokens
// const process.env.jwt_access ?? "" = process.env.jwt_access ?? "";
// const process.env.jwt_access ?? "" = process.env.jwt_refresh ?? "";

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

// ANCHOR: authenticate token
/**
 * Middleware to auth-required routes
 * Validate token and run next() if success
 */
const authenticateToken = (req: any, res: any, next: Function): void => {
    const header: string | undefined = req.headers.auth;

    if (!header) {
        return res.status(401).json({
            success: false,
            error: "not_authorize",
            message:
                "User must be authorize to go to this page but no token was found",
        });
    }

    // header example:
    // auth: "Bearer ds8f9a0udfd9safjdsafu9fuads9f0uasfd9fus9dfduds9fua9sdc"

    // Remove Bearer keyword
    const splitted = header.split(" ");
    const token = splitted.length > 1 ? splitted[1] : undefined;

    // No token
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "not_authorize",
            message:
                "User must be authorize to go to this page but no token was found",
        });
    }

    jwt.verify(token, process.env.jwt_access ?? "", (err: any, userId: any) => {
        // Not validated
        if (err) {
            return res.status(403).json({
                success: false,
                error: "invalid_token",
                message: "Some token was passed but it's invalid token",
            });
        }

        // Set valid authorize user id
        req.userId = userId;

        next();
    });
};

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
    const accessToken: string | undefined = req.body?.accessToken;
    const refreshToken: string | undefined = req.body?.refreshToken;

    if (!id || !accessToken || !refreshToken) {
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
const loginTokenLimitter = rateLimitter({
    windowMs: 10 * 60 * 1000,
    max: 10, // 10 per 10 min
});
/**
 *  This function check user received email & password
 */
Router.post("/login-user", loginTokenLimitter, async (req, res) => {
    const email: string | undefined = req.body.email;
    const password: string | undefined = req.body.password;

    if (!email || !password) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No email or password found in body",
        });
    }

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

    const tokens = await userServices.generateTokenAndDeleteOld(
        userId,
        accessToken,
        refreshToken
    );

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
Router.get("/user/:id", getUserLimitter, async (req, res, next) => {
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
    "/user/setAvatar",
    setUserAvatarLimitter,
    upload.single("photoUrl"),
    async (req, res) => {
        const userId = req.body.userId;

        if (!userId) {
            return res.status(412).json({
                success: false,
                error: "empty_body",
                message: "No userId found in body",
            });
        }

        // generate photo url
        const photoUrl = process.env.url + req.file.path;

        try {
            const dbcode = await userServices.setUserAvatar(userId, photoUrl);

            if (!dbcode.success) {
                return res.status(500).json({
                    success: false,
                    error: dbcode.error,
                    message: dbcode.message,
                });
            }

            return res.status(201).json({
                success: true,
            });
        } catch (e) {
            logger.e(e, e.stack);

            throw new ServerError(e);
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
    // 2 - createdAt & lastActiveAt aslo in user obj
    if (!user || Object.keys(user).length === 2) {
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
    newUser.createdAt = new Date(newUser.createdAt);
    newUser.lastActiveAt = new Date(newUser.lastActiveAt);

    const isValidated = await userServices.validateUser(newUser, false);

    if (!isValidated.success) {
        return res.status(412).json({
            success: false,
            errors: isValidated.errors,
            error: "not_validated_error",
            message: "User is not validated",
        });
    }

    try {
        const dbcode = await userServices.updateUser(newUser);

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

export default Router;
