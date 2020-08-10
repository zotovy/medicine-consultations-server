/// <reference types="../../node_modules/@types/jest/index" />

import supertest from "supertest";
import mongoose from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../../models/doctor";
import Admin from "../../models/admin";
import app, { server } from "../../server";
import jwt from "jsonwebtoken";

// Testable
import adminServices from "../../services/admin_services";

// @types
import {
    DoctorObject,
    BecomeDoctorObj,
    AdminObj,
    AdminRole,
} from "../../types/models";
import {
    IDoctorToDoctorObj,
    DoctorObjToBecomeDoctorObj,
} from "../../services/types_services";
import { AdminAccessToken, AdminRefreshToken } from "../../models/tokens";
import token_services from "../../services/token_services";
import { EWorkPlan } from "../../types/services";

/**
 *  ? This test module testing admin services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Arrange  —— initializes objects and sets the value of data passed to the method for the test.
 *  • Act  —— calls a method for the test with the placed parameters.
 *  • Assert  —— checks that the method for the test works as expected.
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

// Fix @types
declare function done(): any;

// Used to simulate http requests
const request = supertest(app);

// Sample user will use or modify for some cases
const sampleAdmin: AdminObj = {
    username: "panda.code",
    email: "sample@mail.com",
    id: undefined,
    name: "Ivan",
    password: "12345678",
    photoUrl:
        "https://www.gameplan-a.com/wp-content/themes/gameplan-a/assets/img/share/gameplan-a.jpg",
    role: AdminRole.Admin,
};

// Sample user will use or modify for some cases
const sampleDoctor: DoctorObject = {
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
    blankNumber: "12345678",
    blankSeries: "12345678",
    education: "МГУ",
    issueDate: "12.11.2015",
    yearEducation: "2010 - 2015",
    beginDoctorDate: new Date(),
    clientsConsultations: [], // will add later
    clientsReviews: [], // will add later
    experience: 3 * 365,
    favourites: [], // will add later
    rating: 4.6,
    sheldure: [], // will add later
    speciality: [],
    whosFavourite: [], // will add later
    passportIssueDate: "21.11.2015",
    passportIssuedByWhom: "МВД г. Москвы",
    passportSeries: "123123",
    workExperience: "1 год",
    workPlaces: "Городская поликлиника №1 г. Москва",
    serviceExperience: 365,
    age: 25,
    isAdult: false,
    isChild: true,
    workPlan: EWorkPlan.Single,
};

const sampleBecomeDoctorRequest: BecomeDoctorObj = DoctorObjToBecomeDoctorObj(
    sampleDoctor
);

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

const getAuthAdminHeader = async () => {
    const { _id } = await Admin.create(sampleAdmin);
    const token = await token_services.generateToken(
        String(_id),
        "jwt_admin_access"
    );
    await AdminAccessToken.create({ value: token });

    return `Bearer ${token}`;
};

describe("Test Doctor API", () => {
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
        db.connection.dropDatabase();
        server?.close();
        done();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await Doctor.remove({});
        await BecomeDoctorRequest.remove({});
        await Admin.remove({});
        await AdminAccessToken.remove({});
        await AdminRefreshToken.remove({});
    });

    // SECTION: POST /admin/login
    describe("POST /admin/login", () => {
        // ANCHOR: should login admin
        test("should login admin", async (done) => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const admin = { ...sampleAdmin, id: String(_id) };

            //* Act
            const response = await request
                .post("/api/admin/login")
                .type("json")
                .send({ username: admin.username, password: admin.password });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data.success).toEqual(true);
            expect(data.admin).toEqual(admin);
            expect(data.tokens).toBeDefined();

            done();
        });

        // ANCHOR: shouldn't login admin with incorrected data
        test("shouldn't login error admin", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);

            //* Act
            const response = await request
                .post("/api/admin/login")
                .type("json")
                .send({ username: "fake_username", password: "fake_password" });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.admin).toBeUndefined();
            expect(data.tokens).toBeUndefined();
        });
    });
    // /SECTION

    // SECTION POST /admin/become-doctor-request/submit

    describe("POST /admin/become-doctor-request/submit", () => {
        // ANCHOR: should submit sample request
        test("should submit sample request", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            const { _id } = await BecomeDoctorRequest.create(
                sampleBecomeDoctorRequest
            );

            //* Act
            const response = await request
                .post(`/api/admin/become-doctor-request/submit/${_id}`)
                .set("auth", "Bearer " + tokens?.access ?? "");
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data.success).toEqual(true);

            const requests = await BecomeDoctorRequest.find({});
            const doctors = await Doctor.find({});

            expect(requests).toEqual([]);
            expect(doctors.length).toEqual(1);
        });

        // ANCHOR: shouldn't submit request with invalid id
        test("shouldn't submit request with invalid id", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );
            const id = "123456789101";

            //* Act
            const response = await request
                .post(`/api/admin/become-doctor-request/submit/${id}`)
                .set("auth", "Bearer " + tokens?.access ?? "");
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: GET /admin/token/check-access
    describe("GET /admin/token/check-access", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Act
            const response = await request
                .get("/api/admin/token/check-access")
                .query({ id: String(_id), token: tokens?.access });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data.isOk).toEqual(true);
        });

        // ANCHOR: shouldn't validate invalid token
        test("shouldn't validate invalid token", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);

            //* Act
            const response = await request
                .get("/api/admin/token/check-access")
                .query({ id: String(_id), token: "1.2.3" });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.isOk).toEqual(false);
        });
    });
    // /SECTION

    // SECTION: GET /admin/token/is-expired
    describe("GET /admin/token/is-expired", () => {
        // ANCHOR: should validate sample token
        test("should validate sample token", async () => {
            //* Arrange
            const token = jwt.sign("test", process.env.jwt_admin_access ?? "");

            //* Act
            const response = await request
                .get("/api/admin/token/is-expired")
                .query({ token });

            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data.expired).toEqual(false);
        });

        // ANCHOR: shouldn't validate expired token
        test("shouldn't validate expired token", async () => {
            //* Arrange
            const token = jwt.sign(
                { test: "test" },
                process.env.jwt_admin_access ?? "",
                {
                    expiresIn: "1s",
                    algorithm: "HS256",
                }
            );

            //* Act
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const response = await request
                .get("/api/admin/token/is-expired")
                .query({ token });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(data.expired).toEqual(true);
        });
    });
    // /SECTION

    // SECTION: POST admin/token/update-tokens

    describe("POST /admin/token/update-tokens", () => {
        // ANCHOR: should generate correct new tokens
        test("should generate correct new tokens", async (done) => {
            //* Arrange
            const id = "123456789";
            const old_access = jwt.sign(id, process.env.jwt_admin_access ?? "");
            const old_refresh = jwt.sign(
                id,
                process.env.jwt_admin_refresh ?? ""
            );
            await AdminAccessToken.create({ value: old_access });
            await AdminRefreshToken.create({ value: old_refresh });

            //* Act
            const responce = await request
                .post("/api/admin/token/update-tokens")
                .type("json")
                .send({
                    accessToken: old_access,
                    refreshToken: old_refresh,
                    adminId: id,
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
                process.env.jwt_admin_access ?? ""
            );
            const id_refresh: any = jwt.verify(
                data.tokens.refresh,
                process.env.jwt_admin_refresh ?? ""
            );

            expect(id_access.id).toEqual(id);
            expect(id_refresh.id).toEqual(id);

            done();
        });

        // ANCHOR: Should return error on invalid token
        test("Should return error on invalid token", async (done) => {
            //* Arrange
            const id = "123456789101";
            const old_access_token = "some.invalid.access.token";
            const old_refresh_token = "some.invalid.refresh.token";

            //* Act
            const responce = await request
                .post("/api/admin/token/update-tokens")
                .type("json")
                .send({
                    accessToken: old_access_token,
                    refreshToken: old_refresh_token,
                    adminId: id,
                });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toBe(400);
            expect(data.success).toEqual(false);
            expect(data.tokens).toBeUndefined();

            done();
        });
    });

    // /SECTION

    // SECTION: GET /become-doctor-requests
    describe("GET /become-doctor-requests", () => {
        // ANCHOR: should get 3 requests
        test("should get three users", async (done) => {
            //* Arrange
            const header = await getAuthAdminHeader();
            const request1: BecomeDoctorObj = { ...sampleBecomeDoctorRequest };
            const request2: BecomeDoctorObj = {
                ...sampleBecomeDoctorRequest,
                name: "Максим",
                email: "mail1@mail.com",
            };
            const request3: BecomeDoctorObj = {
                ...sampleBecomeDoctorRequest,
                name: "Евгений",
                email: "mail2@mail.com",
            };

            // Create admins using mongoose
            const create1 = await BecomeDoctorRequest.create(request1);
            const create2 = await BecomeDoctorRequest.create(request2);
            const create3 = await BecomeDoctorRequest.create(request3);

            // Update admin id
            request1.id = String(create1._id);
            request2.id = String(create2._id);
            request3.id = String(create3._id);

            // Generate expected answer
            const answer = [request1, request2, request3];

            //* Act
            const responce = await request
                .get("/api/admin/become-doctor-requests")
                .set("auth", header);
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(data.message).toBeUndefined();
            expect(status).toEqual(200);
            expect(data.success).toEqual(true);
            expect(data.requests).toEqual(answer);
            expect(data.error).toBeUndefined();
            expect(data.from).toEqual(0);
            expect(data.to).toEqual(20);

            done();
        });

        // ANCHOR: Should return from 1 to 2 requests
        test("Should return from 1 to 2 requests", async (done) => {
            //* Arrange
            const header = await getAuthAdminHeader();
            const request1: BecomeDoctorObj = { ...sampleBecomeDoctorRequest };
            const request2: BecomeDoctorObj = {
                ...sampleBecomeDoctorRequest,
                name: "Максим",
                email: "mail1@mail.com",
            };
            const request3: BecomeDoctorObj = {
                ...sampleBecomeDoctorRequest,
                name: "Евгений",
                email: "mail2@mail.com",
            };

            // Create admins using mongoose
            const create1 = await BecomeDoctorRequest.create(request1);
            const create2 = await BecomeDoctorRequest.create(request2);
            const create3 = await BecomeDoctorRequest.create(request3);

            // Update admin id
            request1.id = String(create1._id);
            request2.id = String(create2._id);
            request3.id = String(create3._id);

            // Generate expected answer
            const answer = [request2];

            //* Act
            const responce = await request
                .get("/api/admin/become-doctor-requests")
                .set("auth", header)
                .query({ from: 1, amount: 1 });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(200);
            expect(data.requests).toEqual(answer);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();
            expect(data.from).toEqual(1);
            expect(data.to).toEqual(2);

            done();
        });

        // ANCHOR: should return empty array
        test("should return empty array", async (done) => {
            //* Arrange
            const header = await getAuthAdminHeader();

            //* Act
            const responce = await request
                .get("/api/admin/become-doctor-requests")
                .set("auth", header)
                .query({ from: 1, amount: 1 });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Access
            expect(status).toEqual(200);
            expect(data.requests).toEqual([]);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            done();
        });

        // ANCHOR: should return empty array on from = 123
        test("should return empty array on from = 123", async (done) => {
            //* Arrange
            const header = await getAuthAdminHeader();

            //* Act
            const responce = await request
                .get("/api/admin/become-doctor-requests")
                .set("auth", header)
                .query({ from: 123, amount: 100 });
            const status = responce.status;
            const data = JSON.parse(responce.text);
            //* Access
            expect(status).toEqual(200);
            expect(data.requests).toEqual([]);
            expect(data.error).toBeUndefined();
            expect(data.message).toBeUndefined();

            done();
        });

        // ANCHOR: should be protected
        test("should be protected", async (done) => {
            //* Act
            const responce = await request
                .get("/api/admin/become-doctor-requests")
                .query({ from: 123, amount: 100 });
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(status).toEqual(401);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("not_authorize");

            done();
        });
    });
    // /SECTION

    // SECTION: POST /become-doctor-request/remove/:id
    describe("POST /become-doctor-request/remove/:id", () => {
        // ANCHOR: should remove sample request
        test("should remove sample request", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );
            const { _id } = await BecomeDoctorRequest.create(
                sampleBecomeDoctorRequest
            );

            //* Act
            const responce = await request
                .delete(
                    `/api/admin/become-doctor-request/remove/${String(_id)}`
                )
                .set("auth", "Bearer " + tokens?.access ?? "");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(status).toEqual(202);
            expect(data.success).toEqual(true);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests).toEqual([]);
        });

        // ANCHOR: should return false on not existing id provide
        test("should return false on not existing id provide", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );
            const id = "123";

            //* Act
            const responce = await request
                .delete(`/api/admin/become-doctor-request/remove/${id}`)
                .set("auth", "Bearer " + tokens?.access ?? "");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests).toEqual([]);
        });

        // ANCHOR: should remove only one request
        test("should remove only one request", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );
            const { _id } = await BecomeDoctorRequest.create(
                sampleBecomeDoctorRequest
            );
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);

            //* Act
            const responce = await request
                .delete(
                    `/api/admin/become-doctor-request/remove/${String(_id)}`
                )
                .set("auth", "Bearer " + tokens?.access ?? "");
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(status).toEqual(202);
            expect(data.success).toEqual(true);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests.length).toEqual(2);
        });

        // ANCHOR: should 404 error on no id provide
        test("should 404 error on no id provide", async () => {
            //* Arrange
            await Admin.create(sampleAdmin);
            const { tokens } = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);

            //* Act
            const responce = await request
                .delete("/api/admin/become-doctor-request/remove")
                .set("auth", "Bearer " + tokens?.access ?? "");
            const status = responce.status;
            const data = responce.text;

            //* Assert
            expect(status).toEqual(404);
            expect(data).toContain(
                "Cannot DELETE /api/admin/become-doctor-request/remove"
            );
            const requests = await BecomeDoctorRequest.find({});
            expect(requests.length).toEqual(1);
        });

        // ANCHOR: should be protected route
        test("should 404 error on no id provide", async () => {
            //* Arrange
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);

            //* Act
            const responce = await request.delete(
                "/api/admin/become-doctor-request/remove/123456789101"
            );
            const status = responce.status;
            const data = JSON.parse(responce.text);

            //* Assert
            expect(data.error).toEqual("not_authorize");
            expect(data.success).toEqual(false);
            expect(status).toEqual(401);
            const requests = await BecomeDoctorRequest.find({});
            expect(requests.length).toEqual(1);
        });
    });
    // /SECTION
});
