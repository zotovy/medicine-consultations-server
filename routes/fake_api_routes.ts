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
import { AccessToken, RefreshToken } from "../models/tokens";

const Router = ExpressRouter();

Router.post("/remove-users", async (req, res) => {
    await User.remove({});
    res.send(true);
});

Router.post("/remove-tokens", async (req, res) => {
    console.log("remove!");
    await AccessToken.remove({});
    await RefreshToken.remove({});
    res.send(true);
});

export default Router;
