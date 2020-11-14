import { Types } from "mongoose";
import crypto from "crypto";

// Modules
import User from "../models/user";
import Doctor from "../models/doctor";

// Services
import emailServices from "./mail_services";
import { IUserToUserObj } from "./types_services";

// @types
import {
    TGetUsers,
    TCheckUserEmailAndPassword,
    TCreateUser,
    TGetUserById,
    TRemoveUser,
    TSetUserAvatar,
    TUpdateUser,
    TValidateUser,
    TUserValidationErrors,
    TValidationErrorType,
    TResetPassword,
} from "../types/services";
import {
    IUser,
    UserObject,
    IResetPasswordRequest,
    IDoctor,
} from "../types/models";
import { AccessToken, RefreshToken } from "../models/tokens";
import token_services from "./token_services";
import logger from "../logger";
import { ResetPasswordRequest } from "../models/mails";

class UserServices {
    /**
     * ? Middleware to manage users in database
     *
     * Methods:
     * getUsers(), getUserById(id), createUser(data), updateUser(newUser), deleteUser(id)
     *
     * Errors type:
     * - "invalid_error"            # Invalid error was occured
     * - "no_user_found_error"      # No user was found
     * - "created_user_is_null"     # Created user is null
     * - "updated_user_is_null"     # Updated user is null
     * - "deleted_user_is_null"     # Deleted user is null
     */

    // ANCHOR: getUsers
    /**
     * Async get all users
     */
    async getUsers(
        amount: number = 50, // length of returned array, default = 50
        from: number = 0 // start index, default = 0
    ): Promise<TGetUsers> {
        try {
            const raw: IUser[] = await User.find({})
                                           .skip(from)
                                           .limit(amount)
                                           .lean();

            // no user were found
            if (!raw)
                return {
                    success: true,
                    users: [],
                };

            let users: UserObject[] = raw.map((e) => IUserToUserObj(e));
            console.log(`successfully get all users (${users.length})`);

            return {
                success: true,
                users,
            };
        } catch (e) {
            console.log(e);
            return {
                success: false,
                error: "invalid_error",
                message: e,
            };
        }
    }

    // ANCHOR: checkUserEmailAndPassword
    /**
     * Async check received  password & email and return id if success
     */
    async checkUserEmailAndPassword(
        email: string,
        password: string
    ): Promise<TCheckUserEmailAndPassword> {
        let user: IUser | IDoctor | null = await User.findOne({ email });
        let isUser = true;

        if (!user) {
            user = await Doctor.findOne({ email });
            isUser = false;
        }

        // invalid email
        if (!user) {
            return {
                success: false,
                error: "invalid_email",
                message: `No user were found with email=${email}`,
            };
        }

        // success
        if (user.password === password) {
            return {
                success: true,
                id: user._id,
                isUser,
            };
        }

        // invalid password
        return {
            success: false,
            error: "invalid_password",
            message: `User have another password`,
        };
    }

    // ANCHOR: Reset password
    resetPassword = async (
        requestId: string,
        password: string
    ): Promise<TResetPassword> => {
        // Check password
        const isOk = password.match(/^(?=.*\d)(?=.*[a-zA-Z])(?!.*\s).{8,128}$/);
        if (!isOk) {
            return {
                success: false,
                error: "invalid_password",
            };
        }

        // Check existing request on this user
        //@ts-ignore
        const request: IResetPasswordRequest = await ResetPasswordRequest.findById(
            requestId
        ).catch((e) => undefined);

        if (!request) {
            return {
                success: false,
                error: "no_request_found",
            };
        }

        // delete request
        await ResetPasswordRequest.findOneAndDelete({ _id: requestId });

        // Check work time of request (24 hours)
        const msDiff = new Date().getTime() - request?.timestamp.getTime();
        const hourDiff = Math.floor(msDiff / 3600000);

        if (hourDiff >= 24) {
            return {
                success: false,
                error: "expired_error",
            };
        }

        // Set new password
        try {
            const user = await User.findOneAndUpdate(
                { _id: request.userId },
                { password }
            ).catch((e) => null);

            if (!user) {
                return {
                    success: false,
                    error: "no_user_found",
                };
            }

            return {
                success: true,
            };
        } catch (e) {
            logger.e(
                `userServices.resetPassword(): error while updating user with id=${request.userId}. \n${e}`
            );
            return {
                success: false,
                error: "invalid_error",
            };
        }
    };

    // ANCHOR: validateUser
    /**
     * This function validate user and return
     */
    async validateUser(
        user: any,
        needUnique: boolean = true
    ): Promise<TValidateUser> {
        let errors: TUserValidationErrors = {};

        const ErrorType = TValidationErrorType;

        // name
        if (user.name) {
            if (typeof user.name != "string") {
                errors.name = ErrorType.TypeError;
            } else {
                if (user.name.trim() == "") errors.name = ErrorType.LengthError;
            }
        } else if (needUnique) errors.name = ErrorType.RequiredError;

        if (user.surname) {
            if (typeof user.surname != "string") {
                errors.surname = ErrorType.TypeError;
            } else {
                if (user.surname.trim() == "")
                    errors.surname = ErrorType.LengthError;
            }
        } else if (needUnique) errors.surname = ErrorType.RequiredError;

        // phone
        if (!user.phone == undefined || user.phone != -1) {
            if (typeof user.phone != "number") {
                errors.phone = ErrorType.TypeError;
            } else {
                // 79323327361 --> 7
                // 7932332736  --> 0
                // 1111111111  --> 1
                const firstNumber = Math.floor(user.phone / 10000000000);

                if (firstNumber != 7) errors.phone = ErrorType.PhoneFormatError;
            }
        }

        // email
        if (user.email) {
            if (typeof user.email != "string") {
                errors.email = ErrorType.TypeError;
            } else {
                if (
                    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        user.email
                    )
                ) {
                    errors.email = ErrorType.EmailFormatError;
                } else {
                    const users = await User.find({
                        email: user.email,
                    }).select("_id")
                    if (users.length != 0) {
                        if (needUnique) {
                            errors.email = ErrorType.UniqueError;
                        } else {
                            if (users[0]._id !== user.id) {
                                errors.email = ErrorType.UniqueError;
                            }
                        }
                    }

                    const doctors = await Doctor.find({
                        email: user.email,
                    }).select("_id");

                    console.log(doctors);

                    if (doctors.length != 0) {
                        if (needUnique) {
                            errors.email = ErrorType.UniqueError;
                        } else {
                            if (doctors[0].id !== user.id) {
                                errors.email = ErrorType.UniqueError;
                            }
                        }
                    }
                    // if (
                    //     (users.length != 0 && needUnique) ||
                    //     (users.length != 0 && users[0].id != user.id)
                    // ) {
                    //     errors.email = ErrorType.UniqueError;
                    // }
                }
            }
        } else errors.email = ErrorType.RequiredError;

        // password
        if (user.password) {
            if (typeof user.password != "string") {
                errors.password = ErrorType.TypeError;
            } else {
                if (user.password.trim().length < 6)
                    errors.password = ErrorType.LengthError;
            }
        } else errors.password = ErrorType.RequiredError;

        // Sex
        if (user.sex == undefined || user.sex == null) {
            errors.sex = ErrorType.RequiredError;
        } else if (typeof user.sex != "boolean") {
            errors.sex = ErrorType.TypeError;
        }

        // Consultation
        if (!user.consultations) errors.consultations = ErrorType.RequiredError;
        else if (!Array.isArray(user.consultations)) {
            errors.consultations = ErrorType.TypeError;
        }

        // Reviews
        if (!user.reviews) errors.reviews = ErrorType.RequiredError;
        else if (!Array.isArray(user.reviews)) {
            errors.reviews = ErrorType.TypeError;
        }

        // Notification Email
        if (user.notificationEmail) {
            if (typeof user.notificationEmail != "string") {
                errors.notificationEmail = ErrorType.TypeError;
            } else {
                if (
                    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        user.notificationEmail
                    )
                ) {
                    errors.notificationEmail = ErrorType.EmailFormatError;
                } else {
                    const users = await User.find({
                        notificationEmail: user.notificationEmail,
                    });
                    if (users.length != 0) {
                        if (needUnique) {
                            errors.notificationEmail = ErrorType.UniqueError;
                        } else {
                            if (users[0].id !== user.id) {
                                errors.notificationEmail =
                                    ErrorType.UniqueError;
                            }
                        }
                    }
                }
            }
        } else {
            errors.notificationEmail = ErrorType.RequiredError;
        }

        // Send notification to email
        if (
            user.sendNotificationToEmail == undefined ||
            user.sendNotificationToEmail == null
        ) {
            errors.sendNotificationToEmail = ErrorType.RequiredError;
        } else if (typeof user.sendNotificationToEmail != "boolean") {
            errors.sendNotificationToEmail = ErrorType.TypeError;
        }

        // send mailings to email
        if (
            user.sendMailingsToEmail == undefined ||
            user.sendMailingsToEmail == null
        )
            errors.sendMailingsToEmail = ErrorType.RequiredError;
        else if (typeof user.sendMailingsToEmail != "boolean") {
            errors.sendMailingsToEmail = ErrorType.TypeError;
        }

        // created at
        if (user.createdAt == undefined || user.createdAt == null)
            errors.createdAt = ErrorType.RequiredError;
        else if (!(user.createdAt instanceof Date)) {
            errors.createdAt = ErrorType.TypeError;
        } else {
            const parsed = Date.parse(user.createdAt.toString());
            if (isNaN(parsed) || parsed === 0) {
                errors.createdAt = ErrorType.TypeError;
            }
        }

        // last active at
        if (user.lastActiveAt == undefined || user.lastActiveAt == null)
            errors.lastActiveAt = ErrorType.RequiredError;
        else if (!(user.createdAt! instanceof Date)) {
            errors.lastActiveAt = ErrorType.TypeError;
        } else {
            const parsed = Date.parse(user.lastActiveAt.toString());
            if (isNaN(parsed) || parsed === 0) {
                errors.lastActiveAt = ErrorType.TypeError;
            }
        }

        // Favourites
        if (user.favourites == undefined || user.favourites == null) {
            errors.favourites = ErrorType.RequiredError;
        } else if (!Array.isArray(user.favourites)) {
            errors.favourites = ErrorType.TypeError;
        } else {
            for (let i = 0; i < user.favourites.length; i++) {
                if (!Types.ObjectId.isValid(user.favourites[i])) {
                    errors.favourites = ErrorType.TypeError;
                    break;
                }
            }
        }

        if (Object.keys(errors).length == 0) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                errors,
            };
        }
    }

    async validateUpdateUser(user: any): Promise<TValidateUser> {
        let errors: TUserValidationErrors = {};
        const ErrorType = TValidationErrorType;

        // Name
        if (user.name) {
            if (typeof user.name !== "string") errors.name = ErrorType.TypeError;
            else if (user.name.length === 0 || user.name.length > 256) errors.name = ErrorType.LengthError;
        }

        // Surname
        if (user.surname) {
            if (typeof user.surname !== "string") errors.surname = ErrorType.TypeError;
            else if (user.surname.length === 0 || user.surname.length > 256) errors.surname = ErrorType.LengthError;
        }

        // patronymic
        if (user.patronymic) {
            if (typeof user.patronymic !== "string") errors.patronymic = ErrorType.TypeError;
            else if (user.patronymic.length === 0 || user.patronymic.length > 256) errors.patronymic = ErrorType.LengthError;
        }

        // phone
        if (user.phone) {
            if (typeof user.phone !== "number") errors.phone = ErrorType.TypeError;
            else if (user.phone.toString().length !== 11) errors.surname = ErrorType.PhoneFormatError;
        }

        // email
        if (user.email) {
            if (typeof user.email !== "string") errors.email = ErrorType.TypeError;
            else {
                if (
                    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        user.email
                    )
                ) {
                    errors.email = ErrorType.EmailFormatError;
                } else {
                    let users = await User.find({ email: user.email }).select("_id");
                    if (users.length === 0) users = await Doctor.find({ email: user.email }).select("_id");
                    if (users.length > 0 && String(users[0]._id) !== user.id) errors.email = ErrorType.UniqueError;
                }
            }
        }

        // notification email
        if (user.notificationEmail) {
            if (typeof user.notificationEmail !== "string") errors.notificationEmail = ErrorType.TypeError;
            else {
                if (
                    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        user.notificationEmail
                    )
                ) {
                    errors.notificationEmail = ErrorType.EmailFormatError;
                } else {
                    let users = await User.find({ email: user.notificationEmail }).select("_id");
                    if (users.length === 0) users = await Doctor.find({ email: user.notificationEmail }).select("_id");
                    console.log(users);
                    if (users.length > 0 && String(users[0]._id) !== user.id) errors.notificationEmail = ErrorType.UniqueError;
                }
            }
        }

        // country
        if (user.country) {
            if (typeof user.country !== "string") errors.country = ErrorType.TypeError;
            else if (user.country.length === 0 || user.country.length > 256) errors.country = ErrorType.LengthError;
        }

        // city
        if (user.city) {
            if (typeof user.city !== "string") errors.city = ErrorType.TypeError;
            else if (user.city.length === 0 || user.city.length > 256) errors.city = ErrorType.LengthError;
        }

        // birthday
        if (user.birthday) {
            if (!(user.birthday instanceof Date)) errors.birthday = ErrorType.TypeError;
        }

        // isMale
        if (user.sex) {
            if (typeof user.sex !== "boolean") errors.sex = ErrorType.TypeError;
        }

        return {
            success: Object.keys(errors).length == 0,
            errors,
        };
    }

    // ANCHOR: set avatar
    /**
     * This function set received  photo url to received  user
     */
    async setUserAvatar(
        userId: string,
        photoUrl: string
    ): Promise<TSetUserAvatar> {
        // no user id
        if (!userId) {
            return {
                success: false,
                error: "invalid_args",
                message: "userId is required but no user id was pass",
            };
        }

        // no photo url
        if (!photoUrl) {
            return {
                success: false,
                error: "invalid_args",
                message: "photoUrl is required but no user id was pass",
            };
        }

        try {
            let error;
            let user;

            await User.findOneAndUpdate(
                {
                    _id: userId,
                },
                {
                    photoUrl,
                },
                (e, u) => {
                    error = e;
                    user = u;
                }
            );

            if (error) {
                return {
                    success: false,
                    error: "invalid_error",
                    message: error,
                };
            }

            if (!user) {
                return {
                    success: false,
                    error: "no_user_found",
                    message: `No user found with id = ${userId}`,
                };
            }

            console.log(
                `successfully update user (id=${userId}) photo url. New user = ${user}`
            );

            return {
                success: true,
            };
        } catch (e) {
            console.log(e);
            return {
                success: false,
                error: "invalid_error",
                message: e,
            };
        }
    }

    // ANCHOR: get user by id
    /**
     * Async get user by received id
     */
    async getUserById(id: string): Promise<TGetUserById> {
        try {
            let error;

            const user = await User.find(
                {
                    _id: id,
                },
                (err) => {
                    if (err) {
                        error = err;
                    }
                }
            ).select("-__v -password");

            if (error) {
                console.log(error);
                return {
                    success: false,
                    error: "invalid_error",
                    message: error,
                };
            }

            if (user.length == 0) {
                console.log(`No user found with id = ${id}`);
                return {
                    success: false,
                    error: "no_user_found_error",
                    message: `No user found with id = ${id}`,
                };
            }

            console.log(`successfully get user with id ${user[0]._id}`);

            return {
                success: true,
                user: IUserToUserObj(user[0]),
            };
        } catch (e) {
            console.error(e);
            return {
                success: false,
                error: "invalid_error",
                message: e,
            };
        }
    }

    // ANCHOR: create user
    /**
     * Create user and return new user
     */
    async createUser(data: UserObject): Promise<TCreateUser> {
        try {
            const validation = await this.validateUser(data);

            // not validated
            if (!validation.success) {
                console.log(`user is not validated`);
                return {
                    success: false,
                    error: "not_validated_error",
                    errors: validation.errors,
                    message: "User is not validated",
                };
            }

            data.password = this.encryptPassword(data.password);

            const user: IUser = new User(data);

            if (!user) {
                console.log(`created user is null data = ${data}`);
                return {
                    success: false,
                    error: "created_user_is_null",
                    message: "Created user is null",
                };
            }

            // save user to db
            await user.save();

            console.log(`successfully create user with id ${user._id}`);

            return {
                success: true,
                user: IUserToUserObj(user),
            };
        } catch (e) {
            console.log(e);
            return {
                success: false,
                error: "invalid_error",
                message: e,
            };
        }
    }

    // ANCHOR: update user
    /**
     * Update received  user with the same id
     */
    async updateUser(newUser: any): Promise<TUpdateUser> {
        // Check received user
        const responce = await this.validateUpdateUser(newUser);

        // not validated
        if (!responce.success) {
            return {
                success: false,
                error: "not_validated_error",
                message: "User is not validated",
                validationErrors: responce.errors,
            };
        }

        if (newUser.name || newUser.surname || newUser.patronymic) {
            const u = await User.findById(newUser.id ?? "").select("name surname patronymic");
            if (!u) return {
                success: false,
                error: "updated_user_is_null",
                message: "Updated user is null",
            };

            let name = u.name ?? "", surname = u.surname ?? "", patronymic = u.patronymic ?? "";
            if (newUser.name) name = newUser.name;
            if (newUser.surname) surname = newUser.surname;
            if (newUser.patronymic) patronymic = newUser.patronymic;
            newUser.fullName = `${name} ${surname} ${patronymic}`;
        }

        try {
            let user: IUser | null = await User.findOneAndUpdate(
                {
                    _id: newUser.id,
                },
                newUser,
                { new: true }
            );

            if (!user) {

                user = await Doctor.findOneAndUpdate({
                        _id: newUser.id,
                    },
                    newUser,
                    { new: true }
                );

                if (!user) {
                    console.log(`Updated user is null data`, newUser);
                    return {
                        success: false,
                        error: "updated_user_is_null",
                        message: "Updated user is null",
                    };
                }
            }

            return {
                success: true,
                user: IUserToUserObj(user),
            };
        } catch (e) {
            return {
                success: false,
                error: "invalid_error",
                message: e,
            };
        }
    }

    // ANCHOR: remove user
    /**
     * Remove user by received  id
     */
    async removeUser(id: string): Promise<TRemoveUser> {
        const user: IUser | null = await User.findOne({
            _id: id,
        });

        // no user found
        if (!user) {
            console.log(`No user found with id = ${id}`);
            return {
                success: false,
                error: "no_user_found",
                message: `No user found with id = ${id}`,
            };
        }

        let error: any;
        let removed: IUser | undefined | null;

        // remove user
        removed = await user.deleteOne();

        // error
        if (error) {
            console.log(error);
            return {
                success: false,
                error: "invalid_error",
                message: `invalid error when user.remove()`,
            };
        }

        if (removed) {
            console.log(`successfully delete user with id = ${id}`);
            return {
                success: true,
                user: IUserToUserObj(removed),
            };
        } else {
            return {
                success: false,
                error: "removed_user_is_null",
                message: "Removed user is null",
            };
        }
    }

    // ANCHOR: check refresh token
    checkAccessToken = async (
        userId: string,
        token: string
    ): Promise<boolean> =>
        await token_services.checkToken("jwt_access", userId, token);

    // ANCHOR: check refresh token
    checkRefreshToken = async (
        userId: string,
        token: string
    ): Promise<boolean> =>
        await token_services.checkToken("jwt_refresh", userId, token);

    // ANCHOR: generateNewTokens
    generateNewTokens = async (userId: string) => {
        // Generate news token
        const access = token_services.generateToken(userId, "jwt_access");
        const refresh = token_services.generateToken(userId, "jwt_refresh");

        // Add new tokens to db
        await AccessToken.create({ value: access });
        await RefreshToken.create({ value: refresh });

        return { access, refresh };
    };

    // ANCHOR: generate new tokens
    generateTokenAndDeleteOld = async (
        userId: string
    ): Promise<{ access: string; refresh: string }> => {
        return await this.generateNewTokens(userId);
    };

    encryptPassword = (password: string): string => {
        return crypto.createHash('sha256').update(password).digest("base64");
    }
}

export default new UserServices();
