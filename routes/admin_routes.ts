import express from "express";
import rateLimitter from "express-rate-limit";
import adminServices from "../services/admin_services";
import tokenServices from "../services/token_services";
import { IAdminToAdminObj } from "../services/types_services";

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

// ANCHOR: POST /become-doctor-request/submit
Router.post(
    "/become-doctor-request/submit",
    tokenServices.authAdminToken,
    async (req, res) => {
        // Extract request id
        const requestId = req.body.id;

        if (!requestId) {
            return res.status(400).json({
                success: false,
            });
        }

        // Run service function
        const serviceResponse = await adminServices.submitBecomeDoctorRequests(
            requestId
        );

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

// ANCHOR: POST /token/check-access
Router.post("/token/check-access", async (req, res) => {
    // Get token & id
    const { token, id } = req.body;

    if (!token || !id) {
        return res.status(400).json({
            success: false,
        });
    }

    // Check token
    const isOk = await adminServices.checkAccessToken(id, token);

    // return response
    return res.status(isOk ? 200 : 400).json({
        success: isOk,
    });
});

// ANCHOR: POST /token/is-expired
Router.post("/token/is-expired", async (req, res) => {
    // Get token
    // Check token
    // return response
});

export default Router;
