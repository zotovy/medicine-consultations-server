import jwt from "jsonwebtoken";
import { AccessToken } from "../models/tokens";
import logger from "../logger";

class TokenServices {
    // ANCHOR: generate token
    /** Generate and returh token for received user id */
    generateToken = (id: string, key: string): string => {
        logger.i(`generate ${key} token for ${id}`);
        return jwt.sign(
            {
                id,
            },
            process.env[key] ?? "",
            {
                expiresIn: "30m",
            }
        );
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

        // header example:
        // auth: "Bearer ds8f9a0udfd9safjdsafu9fuads9f0uasfd9fus9dfduds9fua9sdc"

        // Remove Bearer keyword
        const splitted = header.split(" ");
        const token = splitted.length > 1 ? splitted[1] : undefined;

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
                req.userId = userId;

                next();
            }
        );
    };
}

export default new TokenServices();
