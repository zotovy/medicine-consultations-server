/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import User from "../../models/user";

// Testable
import userServices from "../user_services";

// @types
import { UserObject } from "../../types/models";
import { AccessToken, RefreshToken } from "../../models/tokens";
import { ResetPasswordRequest } from "../../models/mails";

/**
 *  ? This test module testing user services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Given —— or answer, data which must be received after runnig test object. May have preparatory action
 *  • Result —— received object after running test obj
 *  • Checking —— process of comparisons giving and result. May have more comparisons such as amount of function calls
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

process.env.MODE = "testing";
process.env.url = "localhost:5000/";
process.env.port = "5000";
process.env.mongodb_url = "mongodb://localhost/db";
process.env.useNewUrlParser = "true";
process.env.useFindAndModify = "false";
process.env.useUnifiedTopology = "true";
process.env.jwt_access = "test-access-string";
process.env.jwt_refresh = "test-refresh-string";
process.env.jwt_admin_access = "test-admin-access-string";
process.env.jwt_admin_refresh = "test-admin-refresh-string";

// Sample user will use or modify for some cases
const sampleUser: UserObject = {
    id: undefined,
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    photoUrl: "",
    phone: 79028319028,
    email: "ivanov_ivan@mail.ru",
    password: "ivanovcoolguy911",
    sex: true,
    city: "Москва",
    country: "Россия",
    consultations: [], // will add later
    reviews: [], // will add later
    notificationEmail: "ivanov_ivan@mail.ru",
    sendNotificationToEmail: true,
    sendMailingsToEmail: true,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    favourites: [], // will add later
};

describe("Test UserServices", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/test",
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            },
            (err: any) => {
                if (err) {
                    console.error(err);
                }
            }
        );
    });

    // Close MongodDB connection after all test cases have done
    afterAll(async () => {
        db.disconnect();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await User.remove({});
        await AccessToken.remove({});
        await RefreshToken.remove({});
        await ResetPasswordRequest.deleteMany({});
    });

    // SECTION: getUsers()
    describe("test getUsers()", () => {
        // ANCHOR: should get 3 users
        /** Test getting 3 simple users   */
        test("should get 3 users", async () => {
            //* Given
            const user1: UserObject = { ...sampleUser };
            const user2: UserObject = {
                ...sampleUser,
                name: "Максим",
                email: "mail1@mail.com",
                notificationEmail: "mail1@mail.com",
            };
            const user3: UserObject = {
                ...sampleUser,
                name: "Евгений",
                email: "mail2@mail.com",
                notificationEmail: "mail2@mail.com",
            };

            //* Results
            // Test 1 user
            expect(await User.find({})).toEqual([]);
            const create1 = await User.create(sampleUser);
            user1.id = String(create1._id);
            const response1 = await userServices.getUsers();
            const result1: UserObject[] | undefined = response1.users;

            // Test 2 users
            const create2 = await User.create(user2);
            user2.id = String(create2._id);
            const response2 = await userServices.getUsers();
            const result2: UserObject[] | undefined = response2.users;

            // Test 3 users
            const create3 = await User.create(user3);
            user3.id = String(create3._id);
            const response3 = await userServices.getUsers();
            const result3: UserObject[] | undefined = response3.users;

            // Prepare answers
            const answer1: UserObject[] = [user1];
            const answer2: UserObject[] = [user1, user2];
            const answer3: UserObject[] = [user1, user2, user3];

            //* Checking
            expect(response1.success).toBe(true);
            expect(response2.success).toBe(true);
            expect(response3.success).toBe(true);

            expect(response1.message).toBeUndefined();
            expect(response2.message).toBeUndefined();
            expect(response3.message).toBeUndefined();

            expect(response1.error).toBeUndefined();
            expect(response2.error).toBeUndefined();
            expect(response3.error).toBeUndefined();

            expect(result1).toEqual(answer1);
            expect(result2).toEqual(answer2);
            expect(result3).toEqual(answer3);
        });

        // ANCHOR: shouldn't get user after deleting
        /** Create and delete user. Function must return empty array */
        test("shouldn't get user after deleting", async () => {
            //* Given
            const answer: [] = [];

            //* Result
            const { _id } = await User.create(sampleUser);
            await User.remove({ _id: _id });

            const response = await userServices.getUsers();
            const result = response.users;

            //* Checking
            expect(response.success).toBe(true);
            expect(response.message).toBeUndefined();
            expect(response.error).toBeUndefined();
            expect(result).toEqual(answer);
        });

        // ANCHOR: should get updated user
        /** Create and update user. Function must return array with updated user */
        test("should get updated user", async () => {
            //* Given
            const updatedUser: UserObject = { ...sampleUser, name: "Максим" };

            //* Result
            const { _id } = await User.create(sampleUser);
            await User.updateOne({ _id: _id }, updatedUser);

            updatedUser.id = String(_id);
            const answer: UserObject[] = [updatedUser];

            const response = await userServices.getUsers();
            const result = response.users;

            //* Checking
            expect(response.success).toBe(true);
            expect(response.message).toBeUndefined();
            expect(response.error).toBeUndefined();
            expect(result).toEqual(answer);
        });
    });
    // /SECTION

    // SECTION: checkUserEmailAndPassword()
    describe("test checkUserEmailAndPassword()", () => {
        // ANCHOR: should validate sample user
        /** Create user and rememer email & password. Function must validate this data */
        test("should validate sample user", async () => {
            //* Given
            const email: string = sampleUser.email;
            const password: string = sampleUser.password;

            //* Result
            const { _id } = await User.create(sampleUser);

            const response = await userServices.checkUserEmailAndPassword(
                email,
                password
            );
            const id = response.id;

            //* Checking
            expect(response.success).toBe(true);
            expect(response.message).toBeUndefined();
            expect(response.error).toBeUndefined();
            expect(response.id).toBeDefined();
            expect(id).toStrictEqual(_id);
        });

        // ANCHOR: shouldn't validate wrong email
        /**
         * Create user and trying to validate with wrong email and correct password
         * Function must return success=false
         */
        test("shouldn't validate wrong email", async () => {
            //* Given
            const email = "wrong_email@mail.ru";
            const password = sampleUser.password;

            //* Result
            const { _id } = await User.create(sampleUser);

            const response = await userServices.checkUserEmailAndPassword(
                email,
                password
            );

            //* Checking
            expect(response.success).toBe(false);
            expect(response.message).toBeDefined();
            expect(response.error).toEqual("invalid_email");
            expect(response.id).toBeUndefined();
        });
        // ANCHOR: shouldn't validate wrong password
        /**
         * Create user and trying to validate with correct email and wrong password
         * Function must return success=false
         */
        test("shouldn't validate wrong password", async () => {
            //* Given
            const email = sampleUser.email;
            const password = "somerandomwrongpassword";

            //* Result
            const { _id } = await User.create(sampleUser);

            const response = await userServices.checkUserEmailAndPassword(
                email,
                password
            );

            //* Checking
            expect(response.success).toBe(false);
            expect(response.message).toBeDefined();
            expect(response.error).toEqual("invalid_password");
            expect(response.id).toBeUndefined();
        });
    });
    // /SECTION

    // todo ↓
    // SECTION: sendResetPasswordMail()
    describe("test sendResetPasswordMail()", () => {});
    // /SECTION

    // SECTION: validateUser()
    describe("test validateUser()", () => {
        // ANCHOR: should validate sample user
        /** Function must validate sample user */
        test("should validate sample user", async () => {
            //* Result
            const response = await userServices.validateUser(sampleUser);

            //* Checking
            expect(response.errors).toBeUndefined();
            expect(response.success).toBe(true);
        });

        // ANCHOR: shouldn't validate unique error
        /** Create user. Function shouldn't validate user with the same email & notificationEmail */
        test("shouldn't validate unique error", async () => {
            //* Given
            const errors = {
                email: "unique_error",
                notificationEmail: "unique_error",
            };

            //* Result
            await User.create(sampleUser);
            const response = await userServices.validateUser(sampleUser);

            //* Checking
            expect(response.errors).toEqual(errors);
            expect(response.success).toBe(false);
        });

        // ANCHOR: shouldn't validate type error
        /** Create user. Function shouldn't validate user with type errors */
        test("shouldn't validate type error", async () => {
            //* Given
            const errors = {
                name: "type_error",
                surname: "type_error",
                phone: "type_error",
                email: "type_error",
                password: "type_error",
                sex: "type_error",
                consultations: "type_error",
                reviews: "type_error",
                notificationEmail: "type_error",
                sendNotificationToEmail: "type_error",
                sendMailingsToEmail: "type_error",
                createdAt: "type_error",
                lastActiveAt: "type_error",
                favourites: "type_error",
            };

            const user = {
                id: 123,
                photoUrl: 123,
                name: 123,
                surname: 123,
                phone: "123",
                email: 123,
                password: 123,
                sex: 123,
                consultations: "123",
                reviews: "123",
                notificationEmail: 123,
                sendNotificationToEmail: 123,
                sendMailingsToEmail: 123,
                createdAt: 123,
                lastActiveAt: 123,
                favourites: 123,
            };

            //* Result
            const response = await userServices.validateUser(user);

            //* Checking
            expect(response.errors).toEqual(errors);
            expect(response.success).toBe(false);
        });

        // ANCHOR: shouldn't validate length error
        /** Create user. Function shouldn't validate user with the length & required errors */
        test("shouldn't validate length & required error", async () => {
            //* Given
            const errors = {
                name: "required_error",
                surname: "required_error",
                password: "length_error",
            };

            const user = {
                ...sampleUser,
                name: "",
                surname: "",
                password: "12345",
            };

            //* Result
            const response = await userServices.validateUser(user);

            //* Checking
            expect(response.errors).toEqual(errors);
            expect(response.success).toBe(false);
        });

        // ANCHOR: shouldn't validate incorrect email
        /** Function shouldn't validate user with incorrect email */
        test("shouldn't validate incorrect email", async () => {
            //* Given
            const errors = {
                email: "email_format_error",
                notificationEmail: "email_format_error",
            };
            const user = {
                ...sampleUser,
                email: "some.email.com",
                notificationEmail: "sommail@mail.",
            };

            //* Result
            const response = await userServices.validateUser(user);

            //* Checking
            expect(response.errors).toEqual(errors);
            expect(response.success).toBe(false);
        });
    });
    // /SECTION

    // SECTION: setUserAvatar
    describe("test setUserAvatar()", () => {
        // ANCHOR: should set avatar
        /** Create sample user. Function should update userAvatar. Checking by User.findOne()  */
        test("should set avatar", async () => {
            //* Given
            const avatarUrl =
                "https://it-here.ru/wp-content/uploads/2020/06/macos-big-sur.png";
            const { _id } = await User.create(sampleUser);

            //* Result
            const { success } = await userServices.setUserAvatar(
                _id,
                avatarUrl
            );
            const response = await User.findOne({ _id: _id });

            //* Checking
            expect(success).toBe(true);
            expect(response?.photoUrl).toEqual(avatarUrl);
        });

        // ANCHOR: should return error on unexisting user
        /** Trying to update photo of unexisting user. Function must return error */
        test("should return error on unexisting user ", async () => {
            //* Given
            const id = "some-fake-id";
            const avatarUrl =
                "https://it-here.ru/wp-content/uploads/2020/06/macos-big-sur.png";

            //* Result
            const {
                success,
                error,
                message,
            } = await userServices.setUserAvatar(id, avatarUrl);

            //* Checking
            expect(success).toBe(false);
            expect(error).toBe("no_user_found");
            expect(message).toBeDefined;
        });
    });
    // /SECTION

    // SECTION: getUserById()
    describe("test getUserById()", () => {
        //ANCHOR: should get sample user
        /** Create user by mongoose. Function must return this user */
        test("should get sample user", async () => {
            //* Given
            const { _id } = await User.create(sampleUser);
            const answer = { ...sampleUser, id: String(_id) };

            //* Result
            const response = await userServices.getUserById(_id);
            const user: UserObject | undefined = response.user;

            //* Checking
            expect(response.success).toBe(true);
            expect(response.message).toBeUndefined();
            expect(response.error).toBeUndefined();
            expect(user).toBeDefined();
            expect(user).toEqual(answer);
        });

        //ANCHOR: should return error on unexisting user
        /** Generate random uid and pass it to func. Function must return error */
        test("should return error on unexisting user", async () => {
            //* Given
            const id = "123456789101";

            //* Result
            const response = await userServices.getUserById(id);

            //* Checking
            expect(response.success).toBe(false);
            expect(response.error).toBe("no_user_found_error");
            expect(response.message).toBeDefined();
            expect(response.user).toBeUndefined();
        });
    });
    // /SECTION

    // SECTION: createUser()
    describe("test createUser()", () => {
        //ANCHOR: should create sample user
        /** Function should create user and return user */
        test("should create sample user", async () => {
            //* Result
            const response = await userServices.createUser(sampleUser);
            const success: boolean = response.success;
            const user: UserObject | undefined = response.user;
            const error: string | undefined = response.error;
            const message: string | undefined = response.message;

            const answer = { ...sampleUser, id: user?.id };

            //* Checking
            expect(success).toBe(true);
            expect(user).toBeDefined();
            expect(user).toEqual(answer);
            expect(error).toBeUndefined();
            expect(message).toBeUndefined();
        });

        //ANCHOR: shouldn't create user with unique errror
        /** Сreating user in advance. Function must return unique errors.  */
        test("should create sample user", async () => {
            //* Given
            const errors = {
                email: "unique_error",
                notificationEmail: "unique_error",
            };
            await User.create(sampleUser);

            //* Result
            const response = await userServices.createUser(sampleUser);
            const success: boolean = response.success;
            const user: UserObject | undefined = response.user;
            const error: string | undefined = response.error;
            const message: string | undefined = response.message;

            //* Checking
            expect(success).toBe(false);
            expect(user).toBeUndefined();
            expect(error).toEqual("not_validated_error");
            expect(response.errors).toEqual(errors);
            expect(message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: updateUser()
    describe("test updateUser()", () => {
        // ANCHOR: should update sample user
        /** Create user by mongoose. Function should update user */
        test("should update sample user", async () => {
            //* Given
            const updated: UserObject = {
                id: undefined,
                name: "Вера",
                surname: "Баскова",
                patronymic: "Сергеевна",
                photoUrl: "someUrl",
                phone: 79028319023,
                email: "vera_is_cool@mail.ru",
                password: "tyneugadaeshetotparol",
                sex: false,
                city: "Нур-Султан",
                country: "Казахстан",
                consultations: [], // will add later
                reviews: [], // will add later
                notificationEmail: "veras_second_email@mail.ru",
                sendNotificationToEmail: false,
                sendMailingsToEmail: false,
                createdAt: new Date(),
                lastActiveAt: new Date(),
                favourites: [], // will add later
            };
            const { _id } = await User.create(sampleUser);
            updated.id = String(_id);

            //* Result
            const response = await userServices.updateUser(updated);
            const user: UserObject | undefined = response.user;

            //* Checking
            expect(response.success).toBe(true);
            expect(user).toEqual(updated);
            expect(response.error).toBeUndefined();
            expect(response.message).toBeUndefined();
            expect(response.validationErrors).toBeUndefined();
        });

        // ANCHOR: shouldn't update user with not unique new email
        /**
         * Create 2 users by mongoose. Function shouldn't update user-1
         * with the same email as the user-2
         */
        test("shouldn't update user with not unique new email", async () => {
            //* Given
            const user2 = {
                ...sampleUser,
                email: "someemail@mail.com",
                notificationEmail: "someemail@mail.com",
            };

            // User-2 updated
            const updated: UserObject = {
                ...sampleUser,
                id: undefined,
                name: "Вера",
                surname: "Баскова",
                photoUrl: "someUrl",
                phone: 79028319023,
                email: sampleUser.email,
                password: "tyneugadaeshetotparol",
                sex: false,
                city: "Нур-Султан",
                country: "Казахстан",
                consultations: [], // will add later
                reviews: [], // will add later
                notificationEmail: sampleUser.notificationEmail,
                sendNotificationToEmail: false,
                sendMailingsToEmail: false,
                createdAt: new Date(),
                lastActiveAt: new Date(),
            };

            // errors of user-2
            const errors = {
                email: "unique_error",
                notificationEmail: "unique_error",
            };

            // create users
            await User.create(sampleUser); // user-1
            const { _id } = await User.create(user2); // user-2
            updated.id = _id;

            //* Result
            // update user-2
            const response = await userServices.updateUser(updated);
            const user: UserObject | undefined = response.user;

            //* Checking
            expect(response.success).toBe(false);
            expect(user).toBeUndefined();
            expect(response.error).toEqual("not_validated_error");
            expect(response.validationErrors).toEqual(errors);
            expect(response.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: removeUser()
    describe("test removeUser()", () => {
        // ANCHOR: should remove sample user
        /** Create sample user by mongoose. Function should remove this user */
        test("should remove sample user", async () => {
            //* Given
            const { _id } = await User.create(sampleUser);
            const user = { ...sampleUser, id: String(_id) };

            //* Result
            const response = await userServices.removeUser(_id);
            const users = await User.find({});

            //* Checking
            expect(response.success).toBe(true);
            expect(response.user).toEqual(user);
            expect(response.error).toBeUndefined();
            expect(response.message).toBeUndefined();
            expect(users.length).toEqual(0);
        });

        // ANCHOR: should return error on not exisiting user
        /** Trying to remove not existing user. Function should return error no_user_found*/
        test("should return error on not exisiting user", async () => {
            //* Given
            const id: string = "123456789101";

            //* Result
            const response = await userServices.removeUser(id);

            //* Checking
            expect(response.success).toBe(false);
            expect(response.error).toEqual("no_user_found");
            expect(response.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: checkAccessToken
    describe("checkAccessToken()", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", async () => {
            //* Arrange
            const id = "123456789101";
            const { access } = await userServices.generateNewTokens(id);

            //* Act
            const isOk = await userServices.checkAccessToken(id, access ?? "");

            //* Assert
            expect(isOk).toEqual(true);
        });

        // ANCHOR: shouldn't validate invalid token
        test("shouldn't validate invalid token", async () => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const isOk = await userServices.checkAccessToken(id, "1.2.3");

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate invalid id
        test("shouldn't validate invalid id", async () => {
            //* Arrange
            const id = "123456789101";
            const { access } = await userServices.generateNewTokens(id);

            //* Act
            const isOk = await userServices.checkAccessToken("some-id", access);

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate id which not in db
        test("shouldn't validate id which not in db", async () => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const isOk = await userServices.checkAccessToken(id, "123.123.123");

            //* Assert
            expect(isOk).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: checkRefreshToken
    describe("checkRefreshToken()", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", async () => {
            //* Arrange
            const id = "123456789101";
            const { refresh } = await userServices.generateNewTokens(id);

            //* Act
            const isOk = await userServices.checkRefreshToken(
                id,
                refresh ?? ""
            );

            //* Assert
            expect(isOk).toEqual(true);
        });

        // ANCHOR: shouldn't validate invalid token
        test("shouldn't validate invalid token", async () => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const isOk = await userServices.checkRefreshToken(id, "1.2.3");

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate invalid id
        test("shouldn't validate invalid id", async () => {
            //* Arrange
            const id = "123456789101";
            const { refresh } = await userServices.generateNewTokens(id);

            //* Act
            const isOk = await userServices.checkRefreshToken(
                "some-id",
                refresh ?? ""
            );

            //* Assert
            expect(isOk).toEqual(false);
        });

        // ANCHOR: shouldn't validate id which not in db
        test("shouldn't validate id which not in db", async () => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const isOk = await userServices.checkRefreshToken(
                id,
                "123.123.123"
            );

            //* Assert
            expect(isOk).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: resetPassword
    describe("resetPassword", () => {
        // ANCHOR: should reset password
        test("should reset password", async () => {
            //* Arrange
            const { _id } = await User.create(sampleUser);
            const req = await ResetPasswordRequest.create({
                userId: String(_id),
                timestamp: new Date(),
            });

            //* Act
            const { success, error } = await userServices.resetPassword(
                String(req._id),
                "heyItsMe123"
            );

            //* Assert
            expect(success).toEqual(true);
            expect(error).toBeUndefined();
            expect((await ResetPasswordRequest.find({})).length).toEqual(0);
            expect((await User.find({}))[0].password).toEqual("heyItsMe123");
        });

        // ANCHOR: shouldn't reset incorrect password
        test("shouldn't reset incorrect password", async () => {
            //* Arrange
            const { _id } = await User.create(sampleUser);
            const req = await ResetPasswordRequest.create({
                userId: String(_id),
                timestamp: new Date(),
            });

            //* Act
            const { success, error } = await userServices.resetPassword(
                String(req._id),
                "12345678"
            );

            //* Assert
            expect(success).toEqual(false);
            expect(error).toEqual("invalid_password");
            expect((await ResetPasswordRequest.find({})).length).toEqual(1);
            expect((await User.find({}))[0].password).toEqual(
                sampleUser.password
            );
        });

        // ANCHOR: shouldn't reset without request
        test("shouldn't reset without request", async () => {
            //* Arrange
            await User.create(sampleUser);

            //* Act
            const { success, error } = await userServices.resetPassword(
                "123",
                "heyItsMe123"
            );

            //* Assert
            expect(success).toEqual(false);
            expect(error).toEqual("no_request_found");
            expect((await User.find({}))[0].password).toEqual(
                sampleUser.password
            );
        });

        // ANCHOR: should return no_user_found
        test("should return no_user_found", async () => {
            //* Arrange
            const req = await ResetPasswordRequest.create({
                userId: "123456789101",
                timestamp: new Date(),
            });

            //* Act
            const { success, error } = await userServices.resetPassword(
                String(req._id),
                "heyItsMe123"
            );

            //* Assert
            expect(success).toEqual(false);
            expect(error).toEqual("no_user_found");
        });
    });
    // /SECTION

    // // SECTION: generateTokens
    // describe("generateTokens()", () => {
    //     // ANCHOR: should generate new tokens
    //     test("should generate new tokens", async () => {
    //         //* Arrange
    //         const adminId = "123456789101";
    //         const oldAccess = jwt.sign(
    //             adminId,
    //             process.env.jwt_admin_access ?? ""
    //         );
    //         const oldRefresh = jwt.sign(
    //             adminId,
    //             process.env.jwt_admin_refresh ?? ""
    //         );
    //         await AccessToken.create({ value: oldAccess });
    //         await RefreshToken.create({ value: oldRefresh });

    //         //* Act
    //         const response = await userServices.generateTokenAndDeleteOld(
    //             adminId,
    //             oldAccess,
    //             oldRefresh
    //         );

    //         //* Assert
    //         expect(response.access).toBeDefined();
    //         expect(response.refresh).toBeDefined();

    //         const isAccessOk = await userServices.checkAccessToken(
    //             adminId,
    //             response.access
    //         );
    //         const isRefreshOk = await userServices.checkRefreshToken(
    //             adminId,
    //             response.refresh
    //         );
    //         expect(isAccessOk).toEqual(true);
    //         expect(isRefreshOk).toEqual(true);
    //     });
    // });
    // // /SECTION
});
