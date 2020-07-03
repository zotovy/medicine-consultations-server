const User = require("../models/user");

class UserServices {
    // Service to manage users in database
    //
    // Methods:
    // getUsers(), getUserById(id), createUser(data), updateUser(newUser), deleteUser(id)
    //
    // Errors type:
    // - "invalid_error"            # Invalid error was occured
    // - "no_user_found_error"      # No user was found
    // - "created_user_is_null"     # Created user is null
    // - "updated_user_is_null"     # Updated user is null
    // - "deleted_user_is_null"     # Deleted user is null

    // ANCHOR: get users
    // Async get all users
    // - success: bool
    // - error: string
    // - message: string
    // - users: [obj]
    async getUsers() {
        try {
            const users = await User.find({});

            if (!users)
                return {
                    success: true,
                    users: [],
                };

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

    // ANCHOR: check user
    async checkUser(email, password) {
        const user = await User.findOne({ email });

        if (!user) {
            return {
                success: false,
                error: "no_found",
                message: `No user were found with email=${email}`,
            };
        }

        if (user.password === password) {
            return {
                success: true,
                id: user.id,
            };
        } else {
            return {
                success: false,
                error: "invalid_password",
                message: `User have another password`,
            };
        }
    }

    // ANCHOR: validate
    // This function validate user
    // Return object:
    // - success : bool
    // - errors: obj
    async validateUser(user, needUnique = true) {
        const REQIRED_ERROR = "required_error";
        const TYPE_ERROR = "type_error";
        const UNIQUE_ERROR = "unique_error";
        const LENGTH_ERROR = "length_error";
        const PHONE_FORMAT_ERROR = "phone_format_error";
        const EMAIL_FORMAT_ERROR = "email_format_error";

        let errors = {};

        // name
        if (user.name) {
            if (typeof user.name != "string") {
                errors.name = TYPE_ERROR;
            } else {
                if (user.name.trim() == "") errors.name = LENGTH_ERROR;
            }
        } else errors.name = REQIRED_ERROR;

        if (user.surname) {
            if (typeof user.surname != "string") {
                errors.surname = TYPE_ERROR;
            } else {
                if (user.surname.trim() == "") errors.surname = LENGTH_ERROR;
            }
        } else errors.surname = REQIRED_ERROR;

        // phone
        if (!user.phone == undefined || !user.phone == -1) {
            if (typeof user.phone != "number") {
                errors.phone = TYPE_ERROR;
            } else {
                // 79323327361 --> 7
                // 7932332736  --> 0
                // 1111111111  --> 1
                const firstNumber = Math.floor(user.phone / 10000000000);

                if (firstNumber != 7) errors.phone = PHONE_FORMAT_ERROR;
            }
        }

        // email
        if (user.email) {
            if (typeof user.email != "string") {
                errors.email = TYPE_ERROR;
            } else {
                if (
                    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        user.email
                    )
                ) {
                    errors.email = EMAIL_FORMAT_ERROR;
                } else {
                    const users = await User.find({
                        email: user.email,
                    });
                    if (users.length != 0 && needUnique) {
                        errors.email = UNIQUE_ERROR;
                    }
                }
            }
        } else errors.email = REQIRED_ERROR;

        // password
        if (user.password) {
            if (typeof user.password != "string") {
                errors.password = TYPE_ERROR;
            } else {
                if (user.password.trim().length < 6)
                    errors.password = LENGTH_ERROR;
            }
        } else errors.password = REQIRED_ERROR;

        // Sex
        if (user.sex == undefined || user.sex == null) {
            errors.sex = REQIRED_ERROR;
        } else if (typeof user.sex != "boolean") {
            errors.sex = TYPE_ERROR;
        }

        // Consultation
        if (!user.consultations) errors.consultations = REQIRED_ERROR;
        else if (!Array.isArray(user.consultations)) {
            errors.consultations = TYPE_ERROR;
        }

        // Reviews
        if (!user.reviews) errors.reviews = REQIRED_ERROR;
        else if (!Array.isArray(user.reviews)) {
            errors.consultations = TYPE_ERROR;
        }

        // Notification Email
        if (user.notificationEmail) {
            if (typeof user.notificationEmail != "string") {
                errors.notificationEmail = TYPE_ERROR;
            } else {
                if (
                    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                        user.notificationEmail
                    )
                ) {
                    errors.notificationEmail = EMAIL_FORMAT_ERROR;
                } else {
                    const users = await User.find({
                        notificationEmail: user.notificationEmail,
                    });
                    if (users.length != 0 && needUnique) {
                        errors.notificationEmail = UNIQUE_ERROR;
                    }
                }
            }
        } else {
            errors.notificationEmail = REQIRED_ERROR;
        }

        if (
            user.sendNotificationToEmail == undefined ||
            user.sendNotificationToEmail == null
        ) {
            errors.sendNotificationToEmail = REQIRED_ERROR;
        } else if (typeof user.sendNotificationToEmail != "boolean") {
            errors.sendNotificationToEmail = TYPE_ERROR;
        }

        if (
            user.sendMailingsToEmail == undefined ||
            user.sendMailingsToEmail == null
        )
            errors.sendMailingsToEmail = REQIRED_ERROR;
        else if (typeof user.sendMailingsToEmail != "boolean") {
            errors.sendMailingsToEmail = TYPE_ERROR;
        }

        if (user.createdAt == undefined || user.createdAt == null)
            errors.createdAt = REQIRED_ERROR;
        else if (user.createdAt instanceof Date) {
            errors.createdAt = TYPE_ERROR;
        }

        if (user.lastActiveAt == undefined || user.lastActiveAt == null)
            errors.lastActiveAt = REQIRED_ERROR;
        else if (user.createdAt instanceof Date) {
            errors.createdAt = TYPE_ERROR;
        }

        if (Object.keys(errors).length == 0) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                error: errors,
            };
        }
    }

    // ANCHOR: set avatar
    async setUserAvatar(userId, photoUrl) {
        if (!userId) {
            return {
                success: false,
                error: "invalid_args",
                message: "userId is required but no user id was pass",
            };
        }

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

            // if (!user) {
            //     return {
            //         success: false,
            //         error: "no_user_found",
            //         message: `No user found with id = ${userId}`,
            //     }
            // }

            console.log(
                `successfully update user (id=${userId}) photo url. New user = ${user}`
            );

            return {
                success: true,
                newUser: user,
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
    // Async get user by giving id
    // + id     (id of user which need to get)
    // - success: bool
    // - error: string / undefined (error code)
    // - message: string / undefined (error code)
    // - user: obj / undefined (user, which was getted)
    async getUserById(id) {
        try {
            let error;

            const user = await User.find(
                {
                    _id: id,
                },
                (err, res) => {
                    if (err) {
                        error = err;
                    }
                }
            );

            if (error) {
                console.log(err);
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
                    message: error,
                };
            }

            console.log(`successfully get user with id ${user[0]._id}`);

            return {
                success: true,
                user: user[0],
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

    // ANCHOR: create user
    // Create user and return new user
    // + data   (user, which needs to be created)
    // - success: bool
    // - error: string / undefined (error code)
    // - message: string / undefined (error code)
    // - user: obj / undefined (user, which was created)
    async createUser(data) {
        try {
            const user = new User(data);

            if (!user) {
                console.log(`created user is null data = ${data}`);
                return {
                    success: false,
                    error: "created_user_is_null",
                    message: "Created user is null",
                };
            }

            await user.save();

            console.log(`successfully create user with id ${user._id}`);

            return {
                success: true,
                user,
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
    // Update giving user with the same id
    // + newYUser   (user, which needs to be update)
    // - success: bool
    // - error: string / undefined (error code)
    // - message: string / undefined (error code)
    // - user: obj / undefined (new user, which was updated)
    async updateUser(newUser) {
        try {
            const user = await User.findOneAndUpdate(
                {
                    id: newUser._id,
                },
                newUser
            );

            if (!user) {
                console.log(`Updated user is null data = ${data}`);
                return {
                    success: false,
                    error: "updated_user_is_null",
                    message: "Updated user is null",
                };
            }

            return {
                success: "true",
                user,
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

    // ANCHOR: remove user
    /// Remove user by giving id
    /// - success : bool
    /// - error : obj / undefined
    /// - message : String / undefined (error message)
    /// - user : obj (removedUser)
    async deleteUser(id) {
        let error;

        await User.findOne(
            {
                _id: id,
            },
            async (err, user) => {
                if (err) {
                    console.log(err);
                    return {
                        success: false,
                        error: err,
                    };
                }

                if (!user) {
                    console.log(`No user found with id = ${id}`);
                    return {
                        success: false,
                        error: "no_user_found",
                        message: `No user found with id = ${id}`,
                    };
                }

                let error;
                let removed;

                // remove user
                await user.remove((removeError, removedUser) => {
                    if (removeError) {
                        error = removeError;
                        return null;
                    }

                    if (removedUser) removed = removedUser;
                });

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
                        user: removed,
                    };
                } else {
                    return {
                        success: false,
                        error: "removed_user_is_null",
                        message: "Removed user is null",
                    };
                }
            }
        );

        if (error) {
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error was occured",
            };
        }
    }
}

module.exports = UserServices;
