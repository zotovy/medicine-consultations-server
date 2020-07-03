// const Router = require('../../routes/user');
// const cors = require('cors');
// const mongoose = require("mongoose");
// const express = require('express');
// const User = require("../../models/user");



// describe('test user routes', async () => {
//     const app = express();
//     var server;

//     beforeAll(async () => {
//         await User.remove({});
//         // Setup db
//         var testUri = "mongodb://localhost/test_db";
//         await mongoose.connect(testUri);

//         // setup express test app
//         app.use("/api", Router);
//         app.use(cors());
//         server = app.listen(3005);
//     });

//     afterEach(async () => {
//         await User.remove({});

//     });

//     afterAll(async () => {
//         await mongoose.connection.close();
//         await server.close()
//     });

//     describe("get users", () => {

//         const isSimilar = (excepted, received) => {
//             expect(excepted.name).toEqual(received.name);
//             expect(excepted.surname).toEqual(received.surname);
//             expect(excepted.phone).toEqual(received.phone);
//             expect(excepted.email).toEqual(received.email);
//             expect(excepted.password).toEqual(received.password);
//             expect(excepted.sex).toEqual(received.sex);
//             expect([...excepted.reviews]).toEqual([...received.reviews]);
//             expect([...excepted.consultations]).toEqual([...received.consultations]);
//             expect(excepted.notificationEmail).toEqual(received.notificationEmail);
//             expect(excepted.sendNotificationToEmail).toEqual(received.sendNotificationToEmail);
//             expect(excepted.sendMailingsToEmail).toEqual(received.sendMailingsToEmail);
//             // expect(new Date(excepted.createdAt).toUTCString()).toEqual(received.createdAt); // todo 
//             // expect(new Date(excepted.lastActiveAt).toUTCString()).toEqual(receiveds.lastActiveAt);
//         }

//         test("get typical users", async () => {
//             const user1 = userTestData;
//             const user2 = {
//                 ...userTestData,
//                 email: "testUser2@mail.com",
//                 notificationEmail: "testUser2@mail.com",
//             };
//             const user3 = {
//                 ...userTestData,
//                 email: "testUser3@mail.com",
//                 notificationEmail: "testUser3@mail.com",
//             };

//             const id1 = (await User.create(user1)).id;
//             const id2 = (await User.create(user2)).id;
//             const id3 = (await User.create(user3)).id;

//             const users = await fetch("http://localhost:5000/api/users", {});

//             const founded1 = users.find((elem) => elem.id == id1);
//             const founded2 = users.find((elem) => elem.id == id2);
//             const founded3 = users.find((elem) => elem.id == id3);

//             isSimilar(user1, founded1);
//             isSimilar(user2, founded2);
//             isSimilar(user3, founded3);
//         });
//     });

// });


// const userTestData = {
//     name: "Evgeniy",
//     surname: "Haritonov",
//     phone: 79323327351,
//     email: "evgeniy@mail.com",
//     password: "somenicepassword123",
//     sex: true,
//     city: "Kazan",
//     country: "Russia",
//     consultations: [], // todo
//     reviews: [],
//     notificationEmail: "evgeniy@mail.com",
//     sendNotificationToEmail: true,
//     sendMailingsToEmail: true,
//     createdAt: new Date().toUTCString(),
//     lastActiveAt: new Date().toUTCString(),

// }