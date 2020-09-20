/// <reference types="../../node_modules/@types/jest/index" />
import supertest from "supertest";
import app, { server } from "../../server";
import mongoose from "mongoose";
import ConsultationPayment from "../../models/payment";
import { UserObject } from "../../types/models";
import User from "../../models/user";
import user_services from "../../services/user_services";
import payment_services from "../../services/payment_services";
import PaymentRequest from "../../models/payment";
import { response } from "express";

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

const request = supertest(app);

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
};

const sampleRequest = {
    doctorId: "123456789101",
    userId: "123456789101",
    amount: 500,
};

const getAuthHeader = async (): Promise<string> => {
    const { _id } = await User.create(sampleUser);
    await User.remove({});
    const { access } = await user_services.generateNewTokens(String(_id));
    return `Bearer ${access}`;
};

describe("Test payment routes", () => {
    let db: mongoose.Mongoose;

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
    });

    // Close MongodDB connection after all test cases have done
    afterAll(async (done) => {
        // await User.remove({});
        // db.connection.dropDatabase();
        server?.close();
        done();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await User.remove({});
        await ConsultationPayment.remove({});
    });

    test("should save request payment", async () => {
        //* Act
        const responce = await request
            .post("/api/request-payment")
            .type("json")
            .send(sampleRequest)
            .set("auth", await getAuthHeader());
        const status = responce.status;
        const data = JSON.parse(responce.text);

        //* Access
        expect(status).toEqual(201);
        expect(data.success).toEqual(true);
        expect(data.url).toBeDefined();
    });

    test("should save payment request be protected", async () => {
        //* Act
        const responce = await request
            .post("/api/request-payment")
            .type("json")
            .send(sampleRequest);
        const status = responce.status;
        const data = JSON.parse(responce.text);

        //* Access
        expect(status).toEqual(401);
        expect(data.success).toEqual(false);
        expect(data.error).toEqual("not_authorize");
    });

    test("should get payment request status", async () => {
        //* Arrange
        const { url } = await payment_services.requestPayment(sampleRequest);
        const id = url?.split("/")[url?.split("/").length - 1];

        //* Act
        const responce1 = await request
            .get("/api/get-payment-status/" + id)
            .type("json")
            .send(sampleRequest)
            .set("auth", await getAuthHeader());
        const status1 = responce1.status;
        const data1 = JSON.parse(responce1.text);

        await PaymentRequest.findByIdAndUpdate(id, { status: "success" });
        const responce2 = await request
            .get("/api/get-payment-status/" + id)
            .type("json")
            .send(sampleRequest)
            .set("auth", await getAuthHeader());
        const status2 = responce2.status;
        const data2 = JSON.parse(responce2.text);

        //* Access
        expect(status1).toEqual(200);
        expect(data1.status).toEqual("waiting");
        expect(status2).toEqual(200);
        expect(data2.status).toEqual("success");
    });

    test("should save payment request be protected", async () => {
        //* Arrange
        const { url } = await payment_services.requestPayment(sampleRequest);
        const id = url?.split("/")[url?.split("/").length - 1];

        //* Act
        const responce = await request
            .get("/api/get-payment-status/" + id)
            .type("json")
            .send(sampleRequest);
        const status = responce.status;
        const data = JSON.parse(responce.text);

        //* Access
        expect(status).toEqual(401);
        expect(data.success).toEqual(false);
        expect(data.error).toEqual("not_authorize");
    });
});
