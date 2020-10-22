import jwt from "jsonwebtoken";
import {
    AccessToken,
    AdminAccessToken,
    RefreshToken,
    AdminRefreshToken,
} from "../models/tokens";
import logger from "../logger";
import { error } from "console";

class TokenServices {
    // ANCHOR: generate token
    /** Generate and returh token for received user id */
    generateToken = (id: string, key: string): string => {
        logger.i(`generate ${key} token for ${id}`);

        let expiresIn: string = key.includes("access") ? "10m" : "1y";

        return jwt.sign(
            {
                id,
            },
            process.env[key] ?? "",
            {
                expiresIn,
            }
        );
    };

    private extractTokenFromHeader = (header: string): string => {
        // header example:
        // auth: "Bearer ds8f9a0udfd9safjdsafu9fuads9f0uasfd9fus9dfduds9fua9sdc"

        // Remove Bearer keyword
        const splitted = header.split(" ");
        const token = splitted.length > 1 ? splitted[1] : undefined;

        return token ?? "";
    };

    // ANCHOR: authenticate token middleware
    /**
     * Middleware to auth-required routes
     * Validate token and run next() if success
     */
    authenticateToken = async (
        req: any,
        res: any,
        next: Function
    ): Promise<void> => {
        const header: string | undefined = req.headers.auth;

        if (process.env.MODE === "dev" && req.headers.auth !== "") {
            req.headers.userId = req.headers.auth;
            return next();
        }

        if (!header) {
            logger.w(
                "User must be authorize to go to this page but no token was found"
            );
            return res.status(401).json({
                success: false,
                error: "not_authorize",
                message:
                    "User must be authorize to go to this page but no token was found",
            });
        }

        // Extract token from header
        const token = this.extractTokenFromHeader(header);

        // No token
        if (!token) {
            logger.i("no token were provide");
            return res.status(401).json({
                success: false,
                error: "not_authorize",
                message:
                    "User must be authorize to go to this page but no token was found",
            });
        }

        const founded = await AccessToken.find({ value: token });

        // No token in DB
        if (founded.length === 0) {
            logger.i("invalid token was provide");
            return res.status(401).json({
                success: false,
                error: "not_authorize",
                message:
                    "User must be authorize to go to this page but invalid token were provide",
            });
        }

        jwt.verify(
            token,
            process.env.jwt_access ?? "",
            (err: any, userId: any) => {
                // Not validated
                if (err) {
                    return res.status(403).json({
                        success: false,
                        error: "invalid_token",
                        message: "Some token was passed but it's invalid token",
                    });
                }

                // Set valid authorize user id
                req.headers.userId = userId;

                next();
            }
        );
    };

    // ANCHOR: Authenticate admin token
    /**
     * This middleware will validate giving admin token
     */
    authAdminToken = async (req: any, res: any, next: Function) => {
        const header: string | undefined = req.headers.auth;

        console.log(header);

        if (!header) {
            logger.w(
                "Admin must be authorize to go to this page but no token was found"
            );
            return res.status(401).json({
                success: false,
                error: "not_authorize",
                message:
                    "Admin must be authorize to go to this page but no token was found",
            });
        }

        // Extract token from header
        const token = this.extractTokenFromHeader(header);

        // No token
        if (!token) {
            logger.i("no token were provide");
            return res.status(401).json({
                success: false,
                error: "not_authorize",
                message:
                    "User must be authorize to go to this page but no token was found",
            });
        }

        const founded = await AdminAccessToken.find({ value: token });
        // console.info(token, await AdminAccessToken.find({}));

        // No token in DB
        if (founded.length === 0) {
            logger.i("invalid token was provide");
            return res.status(401).json({
                success: false,
                error: "not_authorize",
                message:
                    "User must be authorize to go to this page but invalid token were provide",
            });
        }

        // Validate id
        jwt.verify(
            token,
            process.env.jwt_admin_access ?? "",
            (err: any, adminId: any) => {
                // Return error if invalid
                if (err) {
                    logger.w(`invalid token were provide, token=${token}`);
                    return res.status(403).json({
                        success: false,
                        error: "not_authorize",
                        message: "Some token was passed but it's invalid token",
                    });
                }

                // Set valid authorize user id
                req.headers.adminId = adminId;

                next();
            }
        );
    };

    // ANCHOR: check token
    checkToken = async (
        key:
            | "jwt_access"
            | "jwt_refresh"
            | "jwt_admin_access"
            | "jwt_admin_refresh",
        adminId: string,
        token: string
    ): Promise<boolean> => {
        // @ts-ignore
        const response = jwt.verify(
            token,
            process.env[key] ?? "",
            (e: any, data: any) => {
                if (e?.name) {
                    return e;
                }
                return data;
            }
        );

        let id: string | undefined;

        if (typeof response === "string") {
            // @ts-ignore
            id = response;
        } else {
            // @ts-ignore
            id = response?.id;
        }

        if (!id) {
            return false;
        }

        let founded: Array<any> = [];

        switch (key) {
            case "jwt_access":
                founded = await AccessToken.find({ value: token });
                break;
            case "jwt_refresh":
                founded = await RefreshToken.find({ value: token });
                break;
            case "jwt_admin_access":
                founded = await AdminAccessToken.find({ value: token });
                break;
            case "jwt_admin_refresh":
                founded = await AdminRefreshToken.find({ value: token });
                break;
        }

        // logger.i(`Is ${key} token ok? ${
        //     adminId === id && adminId.length !== 0 && founded.length === 1
        // }:
        //           adminId === id: ${adminId === id}
        //           adminId.length !== 0: ${adminId.length !== 0}
        //           founded.length === 1: ${founded.length >= 1}
        //           `);

        // @ts-ignore
        return adminId === id && adminId.length !== 0 && founded.length >= 1;
    };
}

export default new TokenServices();
