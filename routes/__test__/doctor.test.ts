/// <reference types="../../node_modules/@types/jest/index" />

import supertest from "supertest";
import mongoose from "mongoose";
import Doctor from "../../models/doctor";
import app, { server } from "../../server";

// Testable
import doctorServices from "../../services/doctor_services";

// @types
import { DoctorObject } from "../../types/models";
import { IDoctorToDoctorObj } from "../../services/types_services";

/**
 *  ? This test module testing user services
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
    beginDoctorDate: new Date(),
    clientsConsultations: [], // will add later
    clientsReviews: [], // will add later
    experience: 3 * 365,
    favourites: [], // will add later
    rating: 4.6,
    sheldure: [], // will add later
    speciality: [],
    whosFavourite: [], // will add later
};

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
    });

    // SECTION
    describe("POST /doctor", () => {
        // ANCHOR: should create sample doctor
        test("should create sample doctor", async (done) => {
            //* Arrange
            const doctor = sampleDoctor;

            //* Act
            const response = await request
                .post("/api/doctor")
                .type("json")
                .send(sampleDoctor);
            const status = response.status;
            const data = JSON.parse(response.text);

            //*  Assert
            doctor.id = data.uid;
            expect(data).toEqual({ success: true, uid: data.uid });
            expect(status).toEqual(201);

            const newDoctor = await doctorServices.getOne(doctor.id);
            expect(newDoctor.doctor).toEqual(doctor);

            done();
        });

        // ANCHOR: should return error on not validated user
        test("should return error on not validated user", async (done) => {
            //* Act
            const response = await request
                .post("/api/doctor")
                .type("json")
                .send({});
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(data.success).toEqual(false);
            expect(data.uid).toBeFalsy();
            expect(data.error).toEqual("not_validated_error");
            expect(Object.keys(data.validationErrors).length).toEqual(14);
            expect(data.message).toBeTruthy();

            const users = await Doctor.find({});
            expect(users).toEqual([]);

            done();
        });
    });
    // /SECTION

    // SECTION: PUT /doctor
    describe("PUT /doctor", () => {
        // ANCHOR: should update sample doctor
        test("should update sample doctor", async (done) => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id), name: "Максим" };

            //* Act
            const response = await request
                .put("/api/doctor")
                .type("json")
                .send(doctor);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert

            data.doctor.beginDoctorDate = new Date(data.doctor.beginDoctorDate);
            data.doctor.createdAt = new Date(data.doctor.createdAt);
            data.doctor.lastActiveAt = new Date(data.doctor.lastActiveAt);

            expect(data).toEqual({ success: true, doctor });
            expect(status).toEqual(202);

            const updated = await doctorServices.getOne(String(_id));
            expect(updated.doctor).toEqual(doctor);

            done();
        });

        // ANCHOR: shouldn't update doctor with errors
        test("shouldn't update doctor with errors", async (done) => {
            //* Act
            const response = await request
                .put("/api/doctor")
                .type("json")
                .send({});
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(data.success).toEqual(false);
            expect(data.doctor).toBeFalsy();
            expect(data.error).toEqual("not_validated_error");
            expect(Object.keys(data.validationErrors).length).toEqual(14);
            expect(data.message).toBeTruthy();

            const users = await Doctor.find({});
            expect(users).toEqual([]);

            done();
        });

        // ANCHOR: shouldn't update not existing doctor
        test("shouldn't update not existing doctor", async (done) => {
            //* Arrange
            const id = "imfakeuserid";

            //* Act
            const response = await request
                .put("/api/doctor")
                .type("json")
                .send({ ...sampleDoctor, id: id });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(data.error).toEqual("updated_doctor_is_null");
            expect(data.success).toEqual(false);
            expect(data.message).toBeTruthy();
            expect(status).toEqual(400);

            done();
        });
    });
    // /SECTION

    // SECTION: DELETE /doctor
    describe("DELETE /doctor", () => {
        // ANCHOR: should delete sample doctor
        test("should delete sample doctor", async (done) => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const response = await request.delete(`/api/doctor/${_id}`);
            const status = response.status;
            const data = JSON.parse(response.text);
            data.doctor = convertDoctorFields(data.doctor);

            //* Assert
            expect(status).toEqual(203);
            expect(data).toEqual({ success: true, doctor });

            const doctors = await Doctor.find({});
            expect(doctors).toEqual([]);

            done();
        });

        // ANCHOR: should return error on not existing doctor
        test("should return error on not existing doctor", async (done) => {
            //* Arrange
            const id = "hiimdoctorid";

            //* Act
            const response = await request.delete(`/api/doctor/${id}`);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("no_doctor_found");
            expect(data.message).toBeDefined();

            done();
        });
    });
    // /SECTION

    // SECTION: GET /doctor/:id
    describe("GET /doctor/:id", () => {
        // ANCHOR: should get sample doctor
        test("should get sample doctor", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const response = await request.get(`/api/doctor/${_id}`);
            const status = response.status;
            const data = JSON.parse(response.text);
            data.doctor = convertDoctorFields(data.doctor);

            //* Assert
            expect(status).toEqual(200);
            expect(data).toEqual({ success: true, doctor });
        });

        // ANCHOR: should return error on unexisting doctor id
        test("should return error on unexisting doctor id", async () => {
            //* Arrange
            const id = "hiimdoctorid";

            //* Act
            const response = await request.get(`/api/doctor/${id}`);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("no_doctor_found");
            expect(data.message).toBeDefined();
        });
    });
    // /SECTION
});
