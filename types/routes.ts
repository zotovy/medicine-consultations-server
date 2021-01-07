import { RequestHandler } from "express";
import { ParsedQs } from "qs";
import { NextFunction, ParamsDictionary, Request, Response, } from "express-serve-static-core";
import { FileArray } from "express-fileupload";

export default interface IRouteHandler extends RequestHandler {};

export interface FileRequest<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs> extends Request<P, ResBody, ReqBody, ReqQuery> {
    files?: FileArray;
}
export interface IFileRouteHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>
    extends RequestHandler<P,ResBody,ReqBody,ReqQuery> {
    (req: FileRequest<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction): any;
}

export interface BaseRouter { [key: string]: any }