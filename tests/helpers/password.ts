import crypto from "crypto";

export const encryptPassword = <T extends { password : string }>(user : T) : T => {
    user.password = crypto.createHash('sha256').update(user.password).digest("base64");
    return user;
};

export const excludePassword = <T extends { password: string }>(user: T): any => {
    let obj : object = {};
    Object.keys(user).forEach((k : string) => {
        // @ts-ignore
        if (k != "password") obj[k] = user[k];
    });
    return obj;
}