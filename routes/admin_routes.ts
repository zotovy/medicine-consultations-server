import express from "express";
import IRouteHandler, { BaseRouter } from "../types/routes";
import { IAdminToAdminObj } from "../services/types_services";
import { Logger } from "../logger";
import { IAdmin } from "../types/models";
import TokenServices from "../services/token_services";
import AdminServices from "../services/admin_services";

const logger = new Logger("AdminRoutes");

export default class AdminRoutes implements BaseRouter {
    router: express.Router;

    constructor() {
        const router = express.Router();
        router.post("/login", AdminRoutes.login);
        router.get("/become-doctor-requests", TokenServices.authAdminToken, AdminRoutes.getBecomeDoctorsRequests);
        router.post("/become-doctor-request/submit/:id", TokenServices.authAdminToken, AdminRoutes.submitBecomeDoctorRequest);
        router.post("/become-doctor-request/remove/:id", TokenServices.authAdminToken, AdminRoutes.removeBecomeDoctorRequest);
        router.get("/token/check-access", AdminRoutes.checkAccessToken);
        router.get("/token/is-expired", AdminRoutes.checkIsTokenExpired);
        router.post("/token/update-tokens", AdminRoutes.updateTokens);
        this.router = router;
    }

    private static login: IRouteHandler = async (req, res) => {
        // Extract username & password from request
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
            });
        }

        // Login using admin services
        const serviceResponse = await AdminServices.login(username, password);

        if (!serviceResponse.success) {
            return res.status(400).json({
                success: false,
            });
        }

        // Return success
        return res.status(200).json({
            success: true,
            admin: IAdminToAdminObj(serviceResponse.admin as IAdmin),
            tokens: serviceResponse.tokens,
        });
    }

    private static getBecomeDoctorsRequests: IRouteHandler = async (req, res) => {
        // Get amount & from
        const amount: number = parseInt(
            (req.query?.amount as string | undefined) ?? "20"
        );
        const from: number = parseInt(
            (req.query?.amount as string | undefined) ?? "0"
        );

        // Get requests
        const requests = await AdminServices.getAllBecomeDoctorsRequests(
            amount,
            from
        );

        // Send requests
        return res.status(200).json({
            success: true,
            hasRequests: requests.length !== 0,
            from,
            to: from + amount,
            requests,
        });
    }

    private static submitBecomeDoctorRequest: IRouteHandler = async (req, res) => {
        // Extract request id
        const requestId = req.params.id;

        if (!requestId) {
            return res.status(400).json({
                success: false,
            });
        }

        // Run service function
        const serviceResponse = await AdminServices.submitBecomeDoctorRequests(
            requestId
        );

        logger.w(serviceResponse.success);

        if (!serviceResponse.success) {
            return res.status(400).json({
                success: false,
            });
        }

        // Return success
        return res.status(200).json({
            success: true,
        });
    }

    private static removeBecomeDoctorRequest: IRouteHandler = async (req, res) => {
        // Get id
        const { id } = req.params;

        // Remove
        const isOk = await AdminServices.removeBecomeDoctorRequest(id);

        // Return response
        return res.status(isOk ? 202 : 400).json({
            success: isOk,
        });
    }

    private static checkAccessToken: IRouteHandler = async (req, res) => {
        // Get token & id
        const { token, id } = req.query;

        if (!token || !id) {
            return res.status(400).json({
                isOk: false,
            });
        }

        // Check token
        const isOk = await AdminServices.checkAccessToken(
            id.toString(),
            token.toString()
        );

        // return response
        return res.status(isOk ? 200 : 400).json({
            isOk,
        });
    }

    private static checkIsTokenExpired: IRouteHandler = async (req, res) => {
        // Get token
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                expired: false,
            });
        }

        // Check token
        const isExpired = AdminServices.isTokenExpired(token.toString());

        // return response
        return res.status(200).json({
            expired: isExpired,
        });
    }

    private static updateTokens: IRouteHandler = async (req, res) => {
        // get refresh token & id
        const { accessToken, refreshToken, adminId } = req.body;

        if (!refreshToken || !adminId || !accessToken) {
            return res.status(501).json({
                success: false,
            });
        }

        // validate refresh token
        const isOk = await AdminServices.checkRefreshToken(adminId, refreshToken);

        // return error if refresh token is invalid
        if (!isOk) {
            return res.status(400).json({
                success: false,
            });
        }

        // create new tokens & delete old
        const tokens = await AdminServices.generateTokenAndDeleteOld(
            adminId,
            accessToken,
            refreshToken
        );

        // return tokens
        return res.status(201).json({
            success: true,
            tokens,
        });
    }
}

