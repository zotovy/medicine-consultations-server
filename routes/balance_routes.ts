import { Router as ExpressRouter } from "express";
import IRouteHandler, { BaseRouter } from "../types/routes";
import BalanceServices from "../services/balance_services";
import RoutesHelper from "../helpers/routes_helper";
import { Logger } from "../logger";
import TokenServices from "../services/token_services";

const _logger = new Logger("BalanceRoutes")

export default class BalanceRoutes implements BaseRouter {
    router: ExpressRouter;

    constructor() {
        const Router = ExpressRouter();
        Router.get("/user/:id/balance", TokenServices.authenticateToken, RoutesHelper.checkIdFromParams("id"), BalanceRoutes.getBalance(true));
        Router.get("/doctor/:id/balance", TokenServices.authenticateToken, RoutesHelper.checkIdFromParams("id"), BalanceRoutes.getBalance(false));
        Router.post("/user/:id/send-transaction-request", TokenServices.authenticateToken, BalanceRoutes.sendTransactionRequest);
        this.router = Router;
    }

    private static getBalance: (isUser: boolean) => IRouteHandler = (isUser) => async (req, res) => {
        const from = parseInt(req.query.from as string ?? "0");
        const to = parseInt(req.query.to as string ?? "0");

        // working with period & period payload
        let period, periodPayload;
        if (typeof req.query.period === "string") {
            const reg1 = new RegExp("this_month|this_week|this_year");
            const reg2 = new RegExp("([2-9][0-9]*)_year|([2-9]|1[0-2]?)_month");
            if (reg1.test(req.query.period)) period = req.query.period;
            else if (reg2.test(req.query.period)) {
                const splitted = req.query.period.split("_");
                const x = splitted[0];
                const keyword = splitted[1];
                period = `x_${keyword}`;
                periodPayload = parseInt(x);
            }
        }

        // merge all params in one opts obj
        const opts: any = { from, to };
        if (period) opts.period = period;
        if (periodPayload) opts.periodPayload = periodPayload;

        // get user id from params
        const uid = req.params.id;

        let status = 200
        const response = await BalanceServices.getBalance(uid, isUser, opts)
            .then(v => ({ success: true, ...v}))
            .catch(error => {
                status = RoutesHelper.getStatus({ 404: ["no_user_found", "no_doctor_found"] }, error);
                _logger.e("getBalance –", error);
                return { success: false, error: error };
            });

        return res.status(status).json(response);
    }

    private static sendTransactionRequest: IRouteHandler = (req, res) => {
        return res.json({ url: "www.google.com" });
    }
}