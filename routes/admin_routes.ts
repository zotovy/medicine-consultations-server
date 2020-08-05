import express, { json } from "express";
import rateLimitter from "express-rate-limit";
import adminServices from "../services/admin_services";
import tokenServices from "../services/token_services";
import { IAdminToAdminObj } from "../services/types_services";
import token_services from "../services/token_services";
import { parse } from "path";
import logger from "../logger";
import { access } from "fs";

// Used to process the http request
const Router = express.Router();

// ANCHOR: login
Router.post("/login", async (req, res) => {
    // Extract username & password from request
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
        });
    }

    // Login using admin services
    const serviceResponse = await adminServices.login(username, password);

    if (!serviceResponse.success) {
        return res.status(400).json({
            success: false,
        });
    }

    // Return success
    return res.status(200).json({
        success: true,
        // @ts-ignore
        admin: IAdminToAdminObj(serviceResponse.admin),
        tokens: serviceResponse.tokens,
    });
});

// ANCHOR: GET /become-doctor-request/
Router.get(
    "/become-doctor-requests",
    tokenServices.authAdminToken,
    async (req, res) => {
        // Get amount & from
        const amount: number = parseInt(
            (req.query?.amount as string | undefined) ?? "20"
        );
        const from: number = parseInt(
            (req.query?.amount as string | undefined) ?? "0"
        );

        // Get requests
        const requests = await adminServices.getAllBecomeDoctorsRequests(
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
);

// ANCHOR: POST /become-doctor-request/submit
Router.post(
    "/become-doctor-request/submit/:id",
    tokenServices.authAdminToken,
    async (req, res) => {
        // Extract request id
        const requestId = req.params.id;

        if (!requestId) {
            return res.status(400).json({
                success: false,
            });
        }

        // Run service function
        const serviceResponse = await adminServices.submitBecomeDoctorRequests(
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
);

// ANCHOR: POST /become-doctor-request/remove/:id
Router.delete(
    "/become-doctor-request/remove/:id",
    tokenServices.authAdminToken,
    async (req, res) => {
        // Get id
        const { id } = req.params;

        // Remove
        const isOk = await adminServices.removeBecomeDoctorRequest(id);

        // Return response
        return res.status(isOk ? 202 : 400).json({
            success: isOk,
        });
    }
);

// ANCHOR: POST /token/check-access
Router.get("/token/check-access", async (req, res) => {
    // Get token & id
    const { token, id } = req.query;

    if (!token || !id) {
        return res.status(400).json({
            isOk: false,
        });
    }

    // Check token
    const isOk = await adminServices.checkAccessToken(
        id.toString(),
        token.toString()
    );

    // return response
    return res.status(isOk ? 200 : 400).json({
        isOk,
    });
});

// ANCHOR: POST /token/is-expired
Router.get("/token/is-expired", async (req, res) => {
    // Get token
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({
            expired: false,
        });
    }

    // Check token
    const isExpired = adminServices.isTokenExpired(token.toString());

    // return response
    return res.status(200).json({
        expired: isExpired,
    });
});

// ANCHOR: POST /token/update-tokens
Router.post("/token/update-tokens", async (req, res) => {
    // get refresh token & id
    const { accessToken, refreshToken, adminId } = req.body;

    console.log(accessToken, refreshToken, adminId);

    if (!refreshToken || !adminId || !accessToken) {
        return res.status(501).json({
            success: false,
        });
    }

    console.log(
        await adminServices.checkRefreshToken(adminId, refreshToken),
        await adminServices.checkAccessToken(adminId, accessToken)
    );

    // validate refresh token
    const isOk = await adminServices.checkRefreshToken(adminId, refreshToken);

    // return error if refresh token is invalid
    if (!isOk) {
        return res.status(400).json({
            success: false,
        });
    }

    // create new tokens & delete old
    const tokens = await adminServices.generateTokenAndDeleteOld(
        adminId,
        accessToken,
        refreshToken
    );

    // return tokens
    return res.status(201).json({
        success: true,
        tokens,
    });
});

export default Router;
