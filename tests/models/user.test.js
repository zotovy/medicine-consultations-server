const mongoose = require("mongoose");
var testUri = "mongodb://localhost/test_db";
mongoose.connect(testUri);
const User = require("../../models/user");

describe("User Model test", () => {
  beforeAll(async () => {
    await User.remove({});
  });

  afterEach(async () => {
    await User.remove({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("defined", () => {
    expect(User).toBeDefined();
  });

  describe("get typical user", () => {
    it("get a user - 1", async () => {
      const user = new User(userTestData);
      await user.save();

      const founded = await User.findOne({
        name: userTestData.name
      });
      const expected = userTestData.name;
      const actual = founded.name;

      expect(actual).toEqual(expected);
    });

    it("get a user - 2", async () => {

      const testUser = {
        ...userTestData,
        name: "Alice",
      };

      const user = new User(testUser);
      await user.save();

      const founded = await User.findOne({
        surname: testUser.surname
      });

      expect(founded.surname).toEqual(testUser.surname);

    });

    it('get a user - 3', async () => {
      const testUser = {
        ...userTestData,
        name: "Roman",
        surname: "Ivanov",
        phone: 79323328390,
        email: "some@mail.com",
        password: "anotherawesomepassword12356",
      };

      const user = new User(testUser);
      await user.save();

      const founded = await User.findOne({
        email: testUser.email
      });



      expect(founded.name).toEqual(testUser.name);
      expect(founded.surname).toEqual(testUser.surname);
      expect(founded.phone).toEqual(testUser.phone);
      expect(founded.email).toEqual(testUser.email);
      expect(founded.password).toEqual(testUser.password);
      expect(founded.sex).toEqual(testUser.sex);
      expect(founded.city).toEqual(testUser.city);
      expect(founded.country).toEqual(testUser.country);
      expect([...founded.reviews]).toEqual(testUser.reviews);
      expect([...founded.consultations]).toEqual(testUser.consultations);
      expect(founded.notificationEmail).toEqual(testUser.notificationEmail);
      expect(founded.sendNotificationToEmail).toEqual(testUser.sendNotificationToEmail);
      expect(founded.sendMailingsToEmail).toEqual(testUser.sendMailingsToEmail);
      expect(new Date(founded.createdAt).toUTCString()).toEqual(testUser.createdAt);
      expect(new Date(founded.lastActiveAt).toUTCString()).toEqual(testUser.lastActiveAt);
    });
  });


  describe('get user with empty optional fields', () => {
    it('get user with empty optional fields', async () => {
      const testUser = {
        name: "Evgeniy",
        surname: "Haritonov",
        email: "evgeniy@mail.com",
        password: "somenicepassword123",
        sex: true,
        consultations: {}, // todo
        reviews: {},
        notificationEmail: "evgeniy@mail.com",
        sendNotificationToEmail: true,
        sendMailingsToEmail: true,
        createdAt: Date().toString().split(" (")[0],
        lastActiveAt: Date().toString().split(" (")[0],
      }

      const user = new User(testUser);
      await user.save();

      const founded = await User.findOne({
        email: testUser.email
      });

      expect(founded.phone).toBeUndefined;
      expect(founded.city).toBeUndefined;
      expect(founded.country).toBeUndefined;

    });
  });



});



const userTestData = {

  name: "Evgeniy",
  surname: "Haritonov",
  phone: 79323327351,
  email: "evgeniy@mail.com",
  password: "somenicepassword123",
  sex: true,
  city: "Kazan",
  country: "Russia",
  consultations: [], // todo
  reviews: [],
  notificationEmail: "evgeniy@mail.com",
  sendNotificationToEmail: true,
  sendMailingsToEmail: true,
  createdAt: new Date().toUTCString(),
  lastActiveAt: new Date().toUTCString(),

}