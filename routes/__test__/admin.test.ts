/// <reference types="../../node_modules/@types/jest/index" />

import supertest from "supertest";
import mongoose from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../../models/doctor";
import Admin from "../../models/admin";
import app, { server } from "../../server";

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

// This function will convert lastActiveAt, createdAt & beginDoctorDate
// from String --> Date and return new doctorObj
const convertDoctorFields = (doctor: any) => {
    if (doctor.lastActiveAt && doctor.createdAt && doctor.beginDoctorDate) {
        // Convert String --> new Date
        doctor.lastActiveAt = new Date(doctor.lastActiveAt);
        doctor.createdAt = new Date(doctor.createdAt);
        doctor.beginDoctorDate = new Date(doctor.beginDoctorDate);
    }
    return doctor;
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

            const id = (
                await BecomeDoctorRequest.create(sampleBecomeDoctorRequest)
            ).id;

            //* Act
            const response = await request
                .post("/api/admin/become-doctor-request/submit")
                .set("auth", "Bearer " + tokens?.access ?? "")
                .type("json")
                .send({ id });
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
                .post("/api/admin/become-doctor-request/submit")
                .set("auth", "Bearer " + tokens?.access ?? "")
                .type("json")
                .send({ id });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
        });
    });

    // /SECTION
});
