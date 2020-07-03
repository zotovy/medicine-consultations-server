// const UserServices = require('../../services/user_services');
// const mongoose = require("mongoose");
// const User = require("../../models/user");

// var testUri = "mongodb://localhost/test_db";
// mongoose.connect(testUri);


// describe("Test User Services", () => {

//     let userServices = new UserServices();

//     beforeAll(async () => {
//         await User.remove({});
//     });

//     afterEach(async () => {
//         await User.remove({});
//         userServices = new UserServices();
//     });

//     afterAll(async () => {
//         await mongoose.connection.close();
//     });


//     test("defined", () => {
//         expect(userServices).toBeDefined();
//     });

//     describe("create user", () => {



//             test("test typical user - 1", async () => {

//                 testUser = userTestData;


//                 await userServices.createUser(userTestData);
//                 const founded = await User.findOne({
//                     name: testUser.name
//                 });


//                 expect(founded.name).toEqual(testUser.name);
//                 expect(founded.surname).toEqual(testUser.surname);
//                 expect(founded.phone).toEqual(testUser.phone);
//                 expect(founded.email).toEqual(testUser.email);
//                 expect(founded.password).toEqual(testUser.password);
//                 expect(founded.sex).toEqual(testUser.sex);
//                 expect([...founded.reviews]).toEqual(testUser.reviews);
//                 expect([...founded.consultations]).toEqual(testUser.consultations);
//                 expect(founded.notificationEmail).toEqual(testUser.notificationEmail);
//                 expect(founded.sendNotificationToEmail).toEqual(testUser.sendNotificationToEmail);
//                 expect(founded.sendMailingsToEmail).toEqual(testUser.sendMailingsToEmail);
//                 expect(new Date(founded.createdAt).toUTCString()).toEqual(testUser.createdAt);
//                 expect(new Date(founded.lastActiveAt).toUTCString()).toEqual(testUser.lastActiveAt);
//             });

//             test("test user with empty option fields", async () => {

//                 testUser = {
//                     ...userTestData,
//                     phone: undefined,
//                     city: undefined,
//                     country: undefined
//                 };

//                 await userServices.createUser(userTestData);
//                 const founded = User.findOne({
//                     _id: testUser._id
//                 });

//                 expect(founded.phone).toBeUndefined();
//                 expect(founded.city).toBeUndefined();
//                 expect(founded.country).toBeUndefined();
//             });

//             test("test user with empty required fields", async () => {
//                     testUser = {
//                         ...userTestData,
//                         name: undefined,
//                         surname: undefined,
//                         email: undefined,
//                         password: undefined,
//                         sex: undefined,
//                         city: undefined,
//                         country: undefined,
//                         consultations: undefined,
//                         reviews: undefined,
//                         notificationEmail: undefined,
//                         sendNotificationToEmail: undefined,
//                         sendMailingsToEmail: undefined,
//                         createdAt: undefined,
//                         lastActiveAt: undefined,
//                     };

//                     const dbcode = await userServices.createUser(testUser);


//                 }
//             })

//         test("test user with invalid email", async () => {
//             testUser = {
//                 ...userTestData,
//                 email: "some invalid email",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.email).not.toBeNull();
//             }
//         })

//         test("test user with invalid email - 2", async () => {
//             testUser = {
//                 ...userTestData,
//                 email: "someinvalidemail@com",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.email).not.toBeNull();
//             }
//         })

//         test("test user with invalid email - 3", async () => {
//             testUser = {
//                 ...userTestData,
//                 email: "someinvalidemail@com.",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.email).not.toBeNull();
//             }
//         })

//         test("test user with invalid email - 4", async () => {
//             testUser = {
//                 ...userTestData,
//                 email: "someinvalidemail//?.@mail.com",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.email).not.toBeNull();
//             }
//         })

//         test("test user with invalid email - 5", async () => {
//             testUser = {
//                 ...userTestData,
//                 email: "",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.email).not.toBeNull();
//             }
//         })

//         test("test user with invalid name & surname", async () => {
//             testUser = {
//                 ...userTestData,
//                 name: "",
//                 surname: ""
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.name).not.toBeNull();
//                 expect(e.errors.surname).not.toBeNull();
//             }
//         });

//         test("test user with invalid password - 1", async () => {
//             testUser = {
//                 ...userTestData,
//                 password: "",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.password).not.toBeNull();
//             }
//         });

//         test("test user with invalid password - 2", async () => {
//             testUser = {
//                 ...userTestData,
//                 password: "12345",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.password).not.toBeNull();
//             }
//         });

//         test("test user with invalid phone - 1", async () => {
//             testUser = {
//                 ...userTestData,
//                 phone: "79323327360",
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e).not.toBeNull(); // Хз, но тут почему-то пустая ошибка :|
//             }
//         });

//         test("test user with invalid phone - 2", async () => {
//             testUser = {
//                 ...userTestData,
//                 phone: 7932332736,
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {

//                 expect(e.errors.phone).not.toBeNull();
//             }
//         });

//         test("test user with invalid phone - 3", async () => {
//             testUser = {
//                 ...userTestData,
//                 phone: 1234567890,
//             }

//             try {
//                 await userServices.createUser(testUser);
//                 expect(() => {}).not.toBeCalled();
//             } catch (e) {
//                 expect(e.errors.phone).not.toBeNull();
//             }
//         });






//     });

// describe("update user", () => {



//     test("test typical user - 1", async () => {

//         testUser = {
//             name: "Elon",
//             surname: "Musk",
//             phone: 79321237351,
//             email: "elon@musk.com",
//             password: "elonsnicepassword",
//             sex: false, // sorry, elon
//             city: "New York",
//             country: "USA",
//             consultations: [], // todo
//             reviews: [],
//             notificationEmail: "anotherelonsemail@mail.com",
//             sendNotificationToEmail: false,
//             sendMailingsToEmail: false,
//             createdAt: new Date().toUTCString(),
//             lastActiveAt: new Date().toUTCString(),
//         };


//         await userServices.createUser(userTestData);
//         await userServices.updateUser(testUser);
//         const founded = await User.findOne({
//             name: testUser.name
//         });


//         expect(founded.name).toEqual(testUser.name);
//         expect(founded.surname).toEqual(testUser.surname);
//         expect(founded.phone).toEqual(testUser.phone);
//         expect(founded.email).toEqual(testUser.email);
//         expect(founded.password).toEqual(testUser.password);
//         expect(founded.sex).toEqual(testUser.sex);
//         expect([...founded.reviews]).toEqual(testUser.reviews);
//         expect([...founded.consultations]).toEqual(testUser.consultations);
//         expect(founded.notificationEmail).toEqual(testUser.notificationEmail);
//         expect(founded.sendNotificationToEmail).toEqual(testUser.sendNotificationToEmail);
//         expect(founded.sendMailingsToEmail).toEqual(testUser.sendMailingsToEmail);
//         expect(new Date(founded.createdAt).toUTCString()).toEqual(testUser.createdAt);
//         expect(new Date(founded.lastActiveAt).toUTCString()).toEqual(testUser.lastActiveAt);
//     });

//     test("test user with empty option fields", async () => {

//         testUser = {
//             ...userTestData,
//             phone: undefined,
//             city: undefined,
//             country: undefined
//         };

//         await userServices.createUser(userTestData);
//         await userServices.updateUser(testUser);
//         const founded = User.findOne({
//             _id: testUser._id
//         });

//         expect(founded.phone).toBeUndefined();
//         expect(founded.city).toBeUndefined();
//         expect(founded.country).toBeUndefined();
//     });

//     test("test user with empty required fields", async () => {
//         testUser = {
//             ...userTestData,
//             name: undefined,
//             surname: undefined,
//             email: undefined,
//             password: undefined,
//             sex: undefined,
//             city: undefined,
//             country: undefined,
//             consultations: undefined,
//             reviews: undefined,
//             notificationEmail: undefined,
//             sendNotificationToEmail: undefined,
//             sendMailingsToEmail: undefined,
//             createdAt: undefined,
//             lastActiveAt: undefined,
//         };

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//             expect(e).not.toBeNull();
//         }
//     })

//     test("test user with invalid email", async () => {
//         testUser = {
//             ...userTestData,
//             email: "some invalid email",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     })

//     test("test user with invalid email - 2", async () => {
//         testUser = {
//             ...userTestData,
//             email: "someinvalidemail@com",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     })

//     test("test user with invalid email - 3", async () => {
//         testUser = {
//             ...userTestData,
//             email: "someinvalidemail@com.",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     })

//     test("test user with invalid email - 4", async () => {
//         testUser = {
//             ...userTestData,
//             email: "someinvalidemail//?.@mail.com",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     })

//     test("test user with invalid email - 5", async () => {
//         testUser = {
//             ...userTestData,
//             email: "",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     })

//     test("test user with invalid name & surname", async () => {
//         testUser = {
//             ...userTestData,
//             name: "",
//             surname: ""
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     });

//     test("test user with invalid password - 1", async () => {
//         testUser = {
//             ...userTestData,
//             password: "",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     });

//     test("test user with invalid password - 2", async () => {
//         testUser = {
//             ...userTestData,
//             password: "12345",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     });

//     test("test user with invalid phone - 1", async () => {
//         testUser = {
//             ...userTestData,
//             phone: "79323327360",
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     });

//     test("test user with invalid phone - 2", async () => {
//         testUser = {
//             ...userTestData,
//             phone: 7932332736,
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {

//             expect(e).not.toBeNull();
//         }
//     });

//     test("test user with invalid phone - 3", async () => {
//         testUser = {
//             ...userTestData,
//             phone: 1234567890,
//         }

//         await userServices.createUser(userTestData);

//         try {
//             await userServices.updateUser(testUser);
//             expect(() => {}).not.toBeCalled();
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     });

// });

// describe("delete user", () => {

//     afterEach(async () => {
//         await User.remove({});
//         userServices = new UserServices();
//     });

//     test("test typical user - 1", async () => {

//         testUser = {
//             name: "Elon",
//             surname: "Musk",
//             phone: 79321237351,
//             email: "elon@musk.com",
//             password: "elonsnicepassword",
//             sex: false, // sorry, elon
//             city: "New York",
//             country: "USA",
//             consultations: [], // todo
//             reviews: [],
//             notificationEmail: "anotherelonsemail@mail.com",
//             sendNotificationToEmail: false,
//             sendMailingsToEmail: false,
//             createdAt: new Date().toUTCString(),
//             lastActiveAt: new Date().toUTCString(),
//         };


//         await User.create(testUser);

//         const id = await User.findOne({
//             email: testUser.email
//         });

//         await userServices.deleteUser(id);

//         expect(await User.find({})).toEqual([]);

//         const founded = await User.findOne({
//             name: testUser.name
//         });


//         expect(founded).toBeNull();
//     });

//     test("test user with empty optional fields", async () => {

//         testUser = {
//             ...userTestData,
//             phone: undefined,
//             city: undefined,
//             country: undefined
//         };

//         await User.create(testUser);

//         const id = await User.findOne({
//             email: testUser.email
//         });

//         await userServices.deleteUser(id);


//         const founded = await User.findOne({
//             email: testUser.email
//         });


//         expect(founded).toBeNull();

//     });

//     test("test nonexistent user", async () => {

//         try {
//             await userServices.deleteUser("some random user");
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }

//     });



// });

// describe("getUser", () => {
//     test("test typical user", async () => {

//         testUser = userTestData;

//         const createdUser = await User.create(testUser);

//         const founded = await userServices.getUserById(createdUser.id);

//         expect(founded.name).toEqual(testUser.name);
//         expect(founded.surname).toEqual(testUser.surname);
//         expect(founded.phone).toEqual(testUser.phone);
//         expect(founded.email).toEqual(testUser.email);
//         expect(founded.password).toEqual(testUser.password);
//         expect(founded.sex).toEqual(testUser.sex);
//         expect([...founded.reviews]).toEqual(testUser.reviews);
//         expect([...founded.consultations]).toEqual(testUser.consultations);
//         expect(founded.notificationEmail).toEqual(testUser.notificationEmail);
//         expect(founded.sendNotificationToEmail).toEqual(testUser.sendNotificationToEmail);
//         expect(founded.sendMailingsToEmail).toEqual(testUser.sendMailingsToEmail);
//         expect(new Date(founded.createdAt).toUTCString()).toEqual(testUser.createdAt);
//         expect(new Date(founded.lastActiveAt).toUTCString()).toEqual(testUser.lastActiveAt);
//     });

//     test("test nonexisting user", async () => {
//         try {
//             await userServices.getUserById("some-id-of-nonexisting-user");
//         } catch (e) {
//             expect(e).not.toBeNull();
//         }
//     });
// });

// describe("get users", () => {

//     const isSimilar = (excepted, received) => {
//         expect(excepted.name).toEqual(received.name);
//         expect(excepted.surname).toEqual(received.surname);
//         expect(excepted.phone).toEqual(received.phone);
//         expect(excepted.email).toEqual(received.email);
//         expect(excepted.password).toEqual(received.password);
//         expect(excepted.sex).toEqual(received.sex);
//         expect([...excepted.reviews]).toEqual([...received.reviews]);
//         expect([...excepted.consultations]).toEqual([...received.consultations]);
//         expect(excepted.notificationEmail).toEqual(received.notificationEmail);
//         expect(excepted.sendNotificationToEmail).toEqual(received.sendNotificationToEmail);
//         expect(excepted.sendMailingsToEmail).toEqual(received.sendMailingsToEmail);
//         // expect(new Date(excepted.createdAt).toUTCString()).toEqual(received.createdAt); // todo 
//         // expect(new Date(excepted.lastActiveAt).toUTCString()).toEqual(receiveds.lastActiveAt);
//     }

//     test("get typical users", async () => {
//         const user1 = userTestData;
//         const user2 = {
//             ...userTestData,
//             email: "testUser2@mail.com",
//             notificationEmail: "testUser2@mail.com",
//         };
//         const user3 = {
//             ...userTestData,
//             email: "testUser3@mail.com",
//             notificationEmail: "testUser3@mail.com",
//         };

//         const id1 = (await User.create(user1)).id;
//         const id2 = (await User.create(user2)).id;
//         const id3 = (await User.create(user3)).id;

//         const users = await userServices.getUsers();

//         const founded1 = users.find((elem) => elem.id == id1);
//         const founded2 = users.find((elem) => elem.id == id2);
//         const founded3 = users.find((elem) => elem.id == id3);

//         isSimilar(user1, founded1);
//         isSimilar(user2, founded2);
//         isSimilar(user3, founded3);
//     });
// });

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