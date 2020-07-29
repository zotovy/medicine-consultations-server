/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin";
import Doctor from "../../models/doctor";

// Testable
import adminServices from "../admin_services";

// @types
import {
    AdminObj,
    AdminRole,
    BecomeDoctorObj,
    DoctorObject,
} from "../../types/models";
import { DoctorObjToBecomeDoctorObj } from "../types_services";
import { BecomeDoctorRequest } from "../../models/doctor";

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
    issueDate: "21.11.2015",
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

const sampleRequest: BecomeDoctorObj = DoctorObjToBecomeDoctorObj(sampleDoctor);

process.env.MODE = "testing";
process.env.url = "localhost:5000/";
process.env.port = "5000";
process.env.mongodb_url = "mongodb://localhost/db";
process.env.useNewUrlParser = "true";
process.env.useFindAndModify = "false";
process.env.useUnifiedTopology = "true";
process.env.jwt_access = "test-access-string";
process.env.jwt_refresh = "test-refresh-string";
process.env.jwt_admin_refresh = "test-admin-refresh-string";
process.env.jwt_admin_access = "test-admin-access-string";

describe("Test Admin services", () => {
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
        await Admin.remove({});
        await Doctor.remove({});
        await BecomeDoctorRequest.remove({});
    });

    // SECTION login()
    describe("login()", () => {
        // ANCHOR: should login sample admin
        test("should login sample admin", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const id = String(_id);
            const admin = { ...sampleAdmin, id };

            //* Act
            const response = await adminServices.login(
                sampleAdmin.username,
                sampleAdmin.password
            );

            //* Assert
            expect(response.success).toEqual(true);
            expect(response.admin).toEqual(admin);

            const jwt_access: string = process.env.jwt_admin_access ?? "-";
            const jwt_refresh: string = process.env.jwt_admin_refresh ?? "-";

            // Verify tokens
            const id_access: any = jwt.verify(
                response.tokens?.access ?? "",
                jwt_access
            );
            const id_refresh: any = jwt.verify(
                response.tokens?.refresh ?? "",
                jwt_refresh
            );

            expect(id_access.id).toEqual(id);
            expect(id_refresh.id).toEqual(id);
        });

        // ANCHOR: shouldn't login error admin
        test("shouldn't login error admin", async () => {
            //* Arrange
            const { _id } = await Admin.create(sampleAdmin);
            const id = String(_id);
            const admin = { ...sampleAdmin, id };

            //* Act
            const response = await adminServices.login(
                "fake_username",
                "fake_password"
            );

            //* Assert
            expect(response.success).toEqual(false);
            expect(response.admin).toBeUndefined();
            expect(response.tokens).toBeUndefined();
        });
    });
    // /SECTION

    // SECTION: submitBecomeDoctorRequests()
    describe("submitBecomeDoctorRequests()", () => {
        // ANCHOR: should submit sample request
        test("should submit sample request", async () => {
            //* Arrange
            const id = (await BecomeDoctorRequest.create(sampleRequest)).id;

            //* Act
            const response = await adminServices.submitBecomeDoctorRequests(id);

            //* Assert
            expect(response.success).toEqual(true);

            const requests = await BecomeDoctorRequest.find({});
            const doctors = await Doctor.find({});

            expect(requests).toEqual([]);
            expect(doctors.length).toEqual(1);
        });

        // ANCHOR: shouldn't submit request with invalid id
        test("shouldn't submit request with invalid id", async () => {
            //* Arrange
            const id = "123456789101";

            //* Act
            const response = await adminServices.submitBecomeDoctorRequests(id);

            //* Assert
            expect(response.success).toEqual(false);
        });
    });
    // /SECTION
});
