import { Types } from "mongoose";

// Modules
import User from "../models/user";

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
} from "../types/services";
import { IUser, UserObject } from "../types/models";
import { error, info } from "console";

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
        const user: IUser | null = await User.findOne({ email });

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
            };
        }

        // invalid password
        return {
            success: false,
            error: "invalid_password",
            message: `User have another password`,
        };
    }

    // ANCHOR: sendResetPasswordMail
    /**
     * This function get user email, check email
     * and set reset password mail
     */
    // todo: mailing
    async sendResetPasswordMail(email: string) {
        // Errors
        const EMAIL_FORMAT_ERROR = "email_format_error";

        // Check given email
        const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (!re.test(email)) {
            return EMAIL_FORMAT_ERROR;
        }

        emailServices.sendResetPasswordEmail(email);
    }

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
        } else errors.name = ErrorType.RequiredError;

        if (user.surname) {
            if (typeof user.surname != "string") {
                errors.surname = ErrorType.TypeError;
            } else {
                if (user.surname.trim() == "")
                    errors.surname = ErrorType.LengthError;
            }
        } else errors.surname = ErrorType.RequiredError;

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
                    });
                    if (users.length != 0) {
                        if (needUnique) {
                            errors.email = ErrorType.UniqueError;
                        } else {
                            if (users[0].id !== user.id) {
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
            );

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
    async updateUser(newUser: UserObject): Promise<TUpdateUser> {
        // Check received user
        const responce = await this.validateUser(newUser, false);

        // not validated
        if (!responce.success) {
            return {
                success: false,
                error: "not_validated_error",
                message: "User is not validated",
                validationErrors: responce.errors,
            };
        }

        try {
            const user: IUser | null = await User.findOneAndUpdate(
                {
                    _id: newUser.id,
                },
                newUser,
                { new: true }
            );

            if (!user) {
                console.log(`Updated user is null data = ${newUser}`);
                return {
                    success: false,
                    error: "updated_user_is_null",
                    message: "Updated user is null",
                };
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
}

export default new UserServices();
