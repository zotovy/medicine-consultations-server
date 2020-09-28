import { Router as Express } from "express";
import consultation_services from "../services/consultation_services";

const Router = Express();

Router.post("/create", async (req, res) => {
    const id = await consultation_services.create(req.body).catch((e) => e);

    const status = id === "invalid_error" ? 500 : Array.isArray(id) ? 400 : 201;
    const body =
        Array.isArray(id) || id === "invalid_error"
            ? { success: false, errors: id }
            : { success: true, id };

    return res.status(status).json(body);
});

export default Router;
