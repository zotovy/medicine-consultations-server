import { Router as ExpressRouter } from "express";
import { BaseRouter } from "../types/routes";

export default class BalanceRoutes implements BaseRouter {
    router: ExpressRouter;
}