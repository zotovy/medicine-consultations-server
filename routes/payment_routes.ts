import { Router as Express, Request, Response } from "express";
import payment_services from "../services/payment_services";
import token_services from "../services/token_services";

const Router = Express();

Router.post(
    "/request-payment",
    token_services.authenticateToken,
    async (req, res) => {
        const response = await payment_services.requestPayment(req.body);
        return res.status(response.success ? 201 : 400).json(response);
    }
);

Router.get(
    "/get-payment-status/:id",
    token_services.authenticateToken,
    async (req, res) => {
        const { id } = req.params;
        const status = await payment_services.getStatus(id);
        return res.status(200).json({ status });
    }
);

// Used for Yandex.kassa
Router.post("/success-payment-callback", async (req, res) => {
    const { id } = req.body;
    checkIp(req, res);
    await payment_services.successed(id);
    return res.status(201);
});

// Used for Yandex.kassa
Router.post("/canceled-payment-callback", async (req, res) => {
    const { id } = req.body;
    checkIp(req, res);
    await payment_services.canceled(id);
    return res.status(201);
});

const checkIp = (req: Request, res: Response): void => {
    const availableIps = [
        "185.71.76.0/27",
        "185.71.77.0/27",
        "77.75.153.0/25",
        "77.75.154.128/25",
        "2a02:5180:0:1509::/64",
        "2a02:5180:0:2655::/64",
        "2a02:5180:0:1533::/64",
        "2a02:5180:0:2669::/64",
    ];

    if (!availableIps.includes(req.ip)) {
        res.status(400).json({
            success: false,
            error: "unknow_ip",
        });
    }
};

export default Router;
