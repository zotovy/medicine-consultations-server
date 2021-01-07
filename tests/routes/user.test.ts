/// <reference types="../../node_modules/@types/jest/index" />

import supertest from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../models/user";
import server from "../../server";

// @types
import { UserObject } from "../../types/models";
import { IUserToUserObj } from "../../services/types_services";
import user_services from "../../services/user_services";
import { ResetPasswordRequest } from "../../models/mails";
import Doctor from "../../models/doctor";
import { sampleDoctor } from "./doctor.test";

/**
 *  ? This test module testing user routes
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Arrange —— or answer, data which  must be received after runnig test object
 *  • Act —— received object after running test obj
 *  • Access —— process of comparisons giving and Act. May have more comparisons such as amount of function calls
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

// Config env to testing
process.env.MODE = "testing";
process.env.url = "localhost:5000/";
process.env.port = "5000";
process.env.mongodb_url = "mongodb://localhost/db";
process.env.useNewUrlParser = "true";
process.env.useFindAndModify = "false";
process.env.useUnifiedTopology = "true";
process.env.jwt_access = "test-access-string";
process.env.jwt_refresh = "test-refresh-string";
process.env.mail = "healty-mountain-testing@mail.ru";
process.env.mailPassword = "321dsa321";
process.env.mailService = "Mail.ru";

// Fix @types
declare function done(): any;

// Sample User will use or modify for some cases
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
    favourites: [],
    fullName: "Иванов Иван Иванович",
    activeConsultations: [],
};

// Used to simulate http requests

test("test env", () => {
    expect(process.env.jwt_access).toBe("test-access-string");
});

describe("Test user routes", () => {
    let db: mongoose.Mongoose;
    let request: supertest.SuperTest<supertest.Test>;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/test",
            {
                useNewUrlParser: true,
                useCreateIndex: false,
                useUnifiedTopology: true,
            },
            (err: any) => {
                if (err) {
                    console.error(err);
                }
            }
        );
        server.setupExpress();
        request = supertest(server.app)
    });

    // Close MongodDB connection after all test cases have done
    afterAll(async (done) => {
        // await User.remove({});
        // db.connection.dropDatabase();
        done();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await User.remove({});
        await Doctor.remove({});
        await ResetPasswordRequest.deleteMany({});
    });

    // SECTION: /generate-token
    describe("Test /generate-token", () => {
        // ANCHOR: should generate tokens to sample user
        /**
         * Pass random id. Function should return the correctly encoded access & refresh tokens
         * Decode received tokens by jwt.verify() and compare with primal id
         */
        test("should generate tokens to sample user", async (done) => {
            //* Arrange
            const id: string = "123456789101";
            const { refresh, access } = await user_services.generateNewTokens(
                id
            );

            //* Act
            const responce = await request
                .post("/api/generate-token")
                .type("json")
                .send({ id, accessToken: access, refreshToken: refresh });

            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data).toBeDefined();
            expect(data.success).toBe(true);
            expect(typeof data.tokens.access).toEqual("string");
            expect(typeof data.tokens.refresh).toEqual("string");

            const jwt_access: string = process.env.jwt_access ?? "-";
            const jwt_refresh: string = process.env.jwt_refresh ?? "-";

            // Verify tokens
            const id_access: any = jwt.verify(data.tokens.access, jwt_access);
            const id_refresh: any = jwt.verify(
                data.tokens.refresh,
                jwt_refresh
            );

            expect(id_access.id).toEqual(id);
            expect(id_refresh.id).toEqual(id);

            done();
        });

        // ANCHOR: should return error on no provided id in body
        /** Trying to send request with no id provided. Function should return error with status 412 */
        test("should return error on no provided id in body", async (done) => {
            //* Act
            const responce = await request.post("/api/generate-token");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(412);
            expect(data.success).toEqual(false);
            expect(data.tokens).toBeUndefined();

            done();
        });
    });
    // /SECTION

    // SECTION: /login-user
    describe("Test /login-user", () => {
        // ANCHOR: should validate simple user
        /**
         * Create sample user using mongoose.
         * Pass email & password to function. Expect correct id
         */
        test("should validate simple user", async (done) => {
            //* Arrange
            const { _id } = await User.create(sampleUser);
            const answer = String(_id);

            //* Act
            const responce = await request
                .post("/api/login-user")
                .type("json")
                .send({
                    email: sampleUser.email,
                    password: sampleUser.password,
                });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(200);
            expect(data.success).toEqual(true);
            expect(data.id).toEqual(answer);
            expect(data.tokens.access).toBeDefined();
            expect(data.tokens.refresh).toBeDefined();

            // Verify tokens
            const id_access: any = jwt.verify(
                data.tokens.access,
                process.env.jwt_access ?? ""
            );
            const id_refresh: any = jwt.verify(
                data.tokens.refresh,
                process.env.jwt_refresh ?? ""
            );

            expect(id_access.id).toEqual(String(_id));
            expect(id_refresh.id).toEqual(String(_id));

            done();
        });

        // ANCHOR: should return error on email,password = undefined
        /** Doesn't pass any email or password. Expect errors */
        test("should validate simple user", async (done) => {
            //* Act
            const responce = await request.post("/api/login-user");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(412);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("empty_body");
            expect(data.message).toBeDefined();
            expect(data.id).toBeUndefined();

            done();
        });
    });
    // /SECTION

    // SECTION: /token
    describe("Test /token", () => {
        // ANCHOR: should generate correct new tokens
        /**
         * 1. Generate tokens using jwt and store it in db
         * 2. Pass generated tokens to function. Function should return new tokens
         * 3. Check new received tokens using jwt
         */
        test("should generate correct new tokens", async (done) => {
            //* Arrange
            const id = "123456789";
            const { refresh, access } = await user_services.generateNewTokens(
                id
            );

            //* Act
            const responce = await request
                .post("/api/token")
                .type("json")
                .send({
                    userId: id,
                    accessToken: access,
                    refreshToken: refresh,
                });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(201);
            expect(data.success).toEqual(true);
            expect(data.tokens.access).toBeDefined();
            expect(data.tokens.refresh).toBeDefined();

            // Verify tokens
            const id_access: any = jwt.verify(
                data.tokens.access,
                process.env.jwt_access ?? ""
            );
            const id_refresh: any = jwt.verify(
                data.tokens.refresh,
                process.env.jwt_refresh ?? ""
            );

            expect(id_access.id).toEqual(id);
            expect(id_refresh.id).toEqual(id);

            done();
        });

        // ANCHOR: Should return error on invalid token
        /** Pass invalid refresh token. Function should return error with status 400 */
        test("Should return error on invalid token", async (done) => {
            //* Arrange
            const id = "123456789";

            //* Act
            const responce = await request
                .post("/api/token")
                .type("json")
                .send({ userId: id, accessToken: "123", refreshToken: "456" });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toBe(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("invalid_token");
            expect(data.tokens).toBeUndefined();

            done();
        });
    });
    // /SECTION

    // SECTION: GET /users
    describe("Test GET /users", () => {
        // ANCHOR: should get three users
        /** Create users using mongoose. Function should return this three users */
        test("should get three users", async (done) => {
            //* Arrange
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

            // Create users using mongoose
            const create1 = await User.create(user1);
            const create2 = await User.create(user2);
            const create3 = await User.create(user3);

            // Update uid
            user1.id = String(create1._id);
            user2.id = String(create2._id);
            user3.id = String(create3._id);

            // Generate expected answer
            const answer = [user1, user2, user3];

            //* Act
            const responce = await request.get("/api/users");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            // Convert String Date ---> Date
            data.users[0].createdAt = new Date(data.users[0].createdAt);
            data.users[1].createdAt = new Date(data.users[1].createdAt);
            data.users[2].createdAt = new Date(data.users[2].createdAt);
            data.users[0].lastActiveAt = new Date(data.users[0].lastActiveAt);
            data.users[1].lastActiveAt = new Date(data.users[1].lastActiveAt);
            data.users[2].lastActiveAt = new Date(data.users[2].lastActiveAt);

            //* Access
            expect(status).toEqual(200);
            expect(data.success).toEqual(true);
            expect(data.users).toEqual(answer);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            done();
        });

        // ANCHOR: Should return from 1 to 2 user
        /**
         * Create three users using mongoose.
         * Passing from = 1, amount = 1 parameters.
         * Function should return only [user2]
         */

        test("Should return from 1 to 2 user", async (done) => {
            //* Arrange
            const user1: UserObject = sampleUser;
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

            // Create users using mongoose
            await User.create(user1);
            const create2 = await User.create(user2);
            await User.create(user3);

            // Update uid
            user2.id = String(create2._id);

            // Generate expected answer
            const answer = [user2];

            //* Act
            const responce = await request.get("/api/users").type("json").send({
                from: 1,
                amount: 1,
            });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            // Convert String Date ---> Date
            data.users[0].createdAt = new Date(data.users[0].createdAt);
            data.users[0].lastActiveAt = new Date(data.users[0].lastActiveAt);

            //* Access
            expect(status).toEqual(200);
            expect(data.users).toEqual(answer);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            done();
        });

        // ANCHOR: should return empty array
        /** Storage is empty. Function should return empty array */
        test("should return empty array", async (done) => {
            //* Act
            const responce = await request.get("/api/users");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(200);
            expect(data.users).toEqual([]);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            done();
        });

        // ANCHOR: should return empty array on from = 123
        /**
         * Storage is empty.
         * Trying to get users started from 123th
         * Function should return empty array
         * */
        test("should return empty array on from = 123", async (done) => {
            //* Act
            const responce = await request
                .get("/api/users")
                .type("json")
                .send({ from: 123 });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(200);
            expect(data.users).toEqual([]);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            done();
        });
    });
    // /SECTION

    // SECTION: GET /user
    describe("Test GET /user/:id", () => {
        // ANCHOR: should get sample user
        /** Create user using mongoose. Function should return this user */
        test("should get sample user", async (done) => {
            //* Arrange
            const { _id } = await User.create(sampleUser);
            const user = { ...sampleUser, id: String(_id) };

            //* Act
            const responce = await request
                .get(`/api/user/${_id}`)
                .type("json")
                .send();
            const status = responce.status;
            const data = JSON.parse(responce.text);

            // Convert String Date ---> Date
            data.user.createdAt = new Date(data.user.createdAt);
            data.user.lastActiveAt = new Date(data.user.lastActiveAt);

            //* Access
            expect(status).toBe(200);
            expect(data.success).toEqual(true);
            expect(data.user).toEqual(user);

            done();
        });

        // ANCHOR: shouldn't get not existing user
        /** Trying to get user using random id. Function shoud return error */
        test("shouldn't get not existing user", async (done) => {
            //* Arrange
            const id: string = "123456789101";

            //* Act
            const responce = await request
                .get(`/api/user/${id}`)
                .type("json")
                .send();
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe("no_user_found_error");
            expect(data.user).toBeUndefined();

            done();
        });
    });
    // /SECTION

    // SECTION: POST /user/setAvatar
    describe("Test POST /user/setAvatar", () => {
        // todo: need to fix upload image
    });
    // /SECTION

    // SECTION: POST /user
    describe("Test POST /user", () => {
        // ANCHOR: should create sample user
        /** Function create sample user. We check the Act using mongoose */
        test("should create sample user", async (done) => {
            //* Act
            const responce = await request
                .post(`/api/user`)
                .type("json")
                .send(sampleUser);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access

            // Convert String Date ---> Date
            data.user.createdAt = new Date(data.user.createdAt);
            data.user.lastActiveAt = new Date(data.user.lastActiveAt);

            // Responce
            expect(status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.user.id).toBeDefined();
            expect({ ...data.user, id: undefined }).toEqual(sampleUser);

            // Tokens
            const id_access: any = jwt.verify(
                data.tokens.access,
                process.env.jwt_access ?? ""
            );
            const id_refresh: any = jwt.verify(
                data.tokens.refresh,
                process.env.jwt_refresh ?? ""
            );

            expect(id_access.id).toEqual(data.user.id);
            expect(id_refresh.id).toEqual(data.user.id);

            done();
        });

        // ANCHOR: shouldn't create not validated user
        /** Pass invalid user to function. Function should return error  */
        test("shouldn't create not validated user", async (done) => {
            //* Arrange
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
            //* Act
            const responce = await request
                .post(`/api/user`)
                .type("json")
                .send(user);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            const users = await User.find({});

            expect(status).toBe(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("not_validated_error");
            expect(data.errors).toEqual(errors);
            expect(users).toEqual([]);
            expect(data.tokens).toBeUndefined();

            done();
        });

        // ANCHOR: should return error on empty body
        /** Pass nothing in function. Should return error */
        test("should return error on empty body", async (done) => {
            //* Act
            const responce = await request.post(`/api/user`);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            const users = await User.find({});

            expect(status).toBe(412);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("empty_body");
            expect(users).toEqual([]);
            expect(data.tokens).toBeUndefined();

            done();
        });
    });
    // /SECTION

    // SECTION PUT /user/:id
    describe("Test PUT /user/:id", () => {
        // ANCHOR: should update simple user
        /** Create user using mongoose. Function should update this user. */
        test("should update simple user", async (done) => {
            //* Arrange
            const { _id } = await User.create(sampleUser);
            const newUser = {
                ...sampleUser,
                name: "Максим",
                id: String(_id),
            };

            //* Act
            const responce = await request
                .put(`/api/user/${_id}`)
                .type("json")
                .send(newUser);
            const status = responce.status;
            const data = JSON.parse(responce.text);
            expect(status).toBe(200);
            expect(data.success).toEqual(true);

            //* Access

            // Convert String Date ---> Date
            data.user.createdAt = new Date(data.user.createdAt);
            data.user.lastActiveAt = new Date(data.user.lastActiveAt);
            expect(data.user).toEqual(newUser);

            const user = await User.find({ _id });

            expect(IUserToUserObj(user[0])).toEqual(newUser);

            done();
        });

        // ANCHOR: shouldn't update user with not unique fields
        /**
         * Create 2 users by mongoose. Function shouldn't update user-1
         * with the same email as the user-2
         */
        test("shouldn't update user with not unique fields", async (done) => {
            //* Arrange
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

            //* Act
            const responce = await request
                .put(`/api/user/${_id}`)
                .type("json")
                .send(updated);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toBe(412);
            expect(data.success).toBe(false);
            expect(data.user).toBeUndefined();
            expect(data.error).toEqual("not_validated_error");
            expect(data.errors).toEqual(errors);
            expect(data.message).toBeDefined();

            done();
        });

        // ANCHOR: should return error on not existing uid
        /** Trying to call function with not existing user id. Function should return error */
        test("should return error on not existing uid", async (done) => {
            //* Arrange
            const id = "123456789101";
            const user = { ...sampleUser, id };

            //* Act
            const responce = await request
                .put(`/api/user/${id}`)
                .type("json")
                .send(user);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.user).toBeUndefined();
            expect(data.error).toEqual("updated_user_is_null");
            expect(data.message).toBeDefined();

            done();
        });
    });
    // /SECTION

    // SECTION: DELETE /user
    describe("Test DELETE /user", () => {
        // ANCHOR: should delete sample user
        /** Create sampleUser using mongoose. Function should delete it */
        test("should delete sample user", async (done) => {
            //* Arrange
            const { _id } = await User.create(sampleUser);
            const user: UserObject = { ...sampleUser, id: String(_id) };

            //* Act
            const responce = await request.delete(`/api/user/${_id}`);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access

            // Convert String Date ---> Date
            data.user.createdAt = new Date(data.user.createdAt);
            data.user.lastActiveAt = new Date(data.user.lastActiveAt);

            expect(status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.user).toEqual(user);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            const users = await User.find({});
            expect(users).toEqual([]);

            done();
        });

        // ANCHOR: should return error on not existing uid
        /** Trying to pass not existing user id ti function. Expect errors */
        test("should return error on not existing uid", async (done) => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const responce = await request.delete(`/api/user/${id}`);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.user).toBeUndefined();
            expect(data.error).toEqual("no_user_found");
            expect(data.message).toBeDefined();

            done();
        });
    });
    // /SECTION

    // ANCHOR: should reset password
    test("should reset password", async () => {
        //* Arrange
        const { _id } = await User.create(sampleUser);
        const req = await ResetPasswordRequest.create({
            userId: String(_id),
            timestamp: new Date(),
        });

        //* Act

        const responce = await request
            .post(`/api/reset-password`)
            .type("json")
            .send({
                requestId: String(req._id),
                password: "heyItsMe123",
            });
        const status = responce.status;
        const data = JSON.parse(responce.text);

        //* Assert
        expect(status).toEqual(201);
        expect(data.success).toEqual(true);
        expect(data.error).toBeUndefined();
        expect((await ResetPasswordRequest.find({})).length).toEqual(0);
        expect((await User.find({}))[0].password).toEqual("heyItsMe123");
    });

    describe("reset password email", () => {
        test("should send reset password", async () => {
            //* Arrange
            const { _id } = await User.create({
                ...sampleUser,
                email: "the1ime@yandex.ru",
            });
            const { access } = await user_services.generateNewTokens(
                String(_id)
            );
            const req = await ResetPasswordRequest.create({
                userId: String(_id),
                timestamp: new Date(),
            });

            //* Act
            const responce = await request
                .post(`/api/send-reset-password-email`)
                .type("json")
                .send({
                    email: "the1ime@yandex.ru",
                });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data.success).toEqual(true);
        });
    });

    describe("update password", () => {
        test("should update password", async (done) => {
            //* Arrange
            const password = user_services.encryptPassword(sampleUser.password);
            const { _id } = await User.create({ ...sampleUser, password });
            const newPassword = "12345678Aa";
            const { access } = await user_services.generateNewTokens(String(_id));

            //* Act
            const response = await request
                .post(`/api/user/${_id}/update-password`)
                .set("auth", `Bearer ${access}`)
                .type("json")
                .send({
                    oldPassword: sampleUser.password,
                    newPassword,
                });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(202);
            expect(data.success).toEqual(true);

            const u = await User.findById(_id);
            const encNew = user_services.encryptPassword(newPassword);
            expect(encNew).toEqual(u?.password);

            done();
        });


        test("should update doctor password", async (done) => {
            //* Arrange
            const password = user_services.encryptPassword(sampleDoctor.password);
            const { _id } = await Doctor.create({ ...sampleDoctor, password });
            const newPassword = "12345678Aa";
            const { access } = await user_services.generateNewTokens(String(_id));

            //* Act
            const response = await request
                .post(`/api/user/${_id}/update-password`)
                .set("auth", `Bearer ${access}`)
                .type("json")
                .send({
                    oldPassword: sampleUser.password,
                    newPassword,
                    isUser: false,
                });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(202);
            expect(data.success).toEqual(true);

            const u = await Doctor.findById(_id);
            const encNew = user_services.encryptPassword(newPassword);
            expect(encNew).toEqual(u?.password);

            done();
        });

        test("shouldn't update with invalid old password", async (done) => {
            //* Arrange
            const password = user_services.encryptPassword(sampleDoctor.password);
            const { _id } = await Doctor.create({ ...sampleDoctor, password });
            const newPassword = "12345678Aa";
            const { access } = await user_services.generateNewTokens(String(_id));

            //* Act
            const response = await request
                .post(`/api/user/${_id}/update-password`)
                .set("auth", `Bearer ${access}`)
                .type("json")
                .send({
                    oldPassword: sampleUser.password + "invalid",
                    newPassword,
                    isUser: false,
                });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("invalid_old_password");

            const u = await Doctor.findById(_id);
            expect(password).toEqual(u?.password);

            done();
        });

        test("shouldn't update with easy new password", async (done) => {
            //* Arrange
            const password = user_services.encryptPassword(sampleDoctor.password);
            const { _id } = await Doctor.create({ ...sampleDoctor, password });
            const newPassword = "1234567";
            const { access } = await user_services.generateNewTokens(String(_id));

            //* Act
            const response = await request
                .post(`/api/user/${_id}/update-password`)
                .set("auth", `Bearer ${access}`)
                .type("json")
                .send({
                    oldPassword: sampleDoctor.password,
                    newPassword,
                    isUser: false,
                });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("password_doesnt_meet_requirements");

            const u = await Doctor.findById(_id);
            expect(password).toEqual(u?.password);

            done();
        });

        test("should return error on invalid user id", async (done) => {
            //* Arrange
            const password = user_services.encryptPassword(sampleDoctor.password);
            const { _id } = await Doctor.create({ ...sampleDoctor, password });
            const newPassword = "12345678Aa";
            const { access } = await user_services.generateNewTokens(String(_id));

            //* Act
            const response = await request
                .post(`/api/user/${123456789101}/update-password`)
                .set("auth", `Bearer ${access}`)
                .type("json")
                .send({
                    oldPassword: sampleDoctor.password,
                    newPassword,
                    isUser: false,
                });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("no_user_found");

            const u = await Doctor.findById(_id);
            expect(password).toEqual(u?.password);

            done();
        });
    });
});
