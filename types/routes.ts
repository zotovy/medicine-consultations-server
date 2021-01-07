import { RequestHandler } from "express";
import { ParsedQs } from "qs";
import { ParamsDictionary, } from "express-serve-static-core";

export default interface IRouteHandler extends RequestHandler {};

export interface IFileRouteHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>
    extends RequestHandler<P,ResBody,ReqBody,ReqQuery> {}

export interface BaseRouter { [key: string]: any }