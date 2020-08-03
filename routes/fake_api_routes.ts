/**
 **FAKE API - used to e2e testing apps.
 * For example `POST /fake/remove-users` route remove all users but
 * only from fake-db. Other databases remain untouched.
 *
 * WARNING: This routes is unsecury and don't cover by tests
 *
 * - This routes should be used only localy.
 * - To enable this routes set MODE to "fake"
 */

import { Router as ExpressRouter } from "express";
import User from "../models/user";

const Router = ExpressRouter();

Router.post("/remove-users", async (req, res) => {
    await User.remove({});
    res.send(true);
});

export default Router;
