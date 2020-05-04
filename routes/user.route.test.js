const request = require("supertest");
const app = require("../app");

const { teardownMongoose } = require("../utils/testTeardownMongoose");
const userData = require("../data/testUserData");
const User = require("../models/user.model");

describe("User Route", () => {
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await User.create(userData);
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  describe("/user/register", () => {
    it("POST /user/register should add a user and return a new user object", async () => {
      const expectedUser = {
        username: "aberkhoo",
        password: "123456789",
      };

      const { body: actualUser } = await request(app)
        .post("/user/register")
        .send(expectedUser)
        .expect(200);

      expect(actualUser.username).toBe(expectedUser.username.toLowerCase());
      expect(actualUser.password).not.toBe(expectedUser.password);
    });

    it("POST /user/register should return 400 bad erquest error message when request is invalid", async () => {
      const { body: error } = await request(app)
        .post("/user/register")
        .send({ badRequest: "" })
        .expect(400);

      expect(error.error).toBe("Invalid inputs");
    });

    it("POST /user/register with name less than 3 characters will give 400 error", async () => {
      const { body: error } = await request(app)
        .post("/user/register")
        .send({ username: "tt", password: "123456789" })
        .expect(400);

      expect(error.error).toBe("Invalid inputs");
    });

    it("POST /user/register with password less than 8 characters will give 400 error", async () => {
      const { body: error } = await request(app)
        .post("/user/register")
        .send({ username: "test", password: "1234567" })
        .expect(400);

      expect(error.error).toBe("Invalid inputs");
    });
  });

  describe("/login", () => {
    it("POST /user/login should login user if username and password is correct", async () => {
      const loginUser = {
        username: userData[1].username,
        password: userData[1].password,
      };

      const { text: message } = await request(app)
        .post("/user/login")
        .send(loginUser)
        .expect("set-cookie", /token=.*; Path=\/; Expires=.* HttpOnly/)
        .expect(200);

      expect(message).toEqual("You are logged in");
    });

    it("POST /user/login should not log trainer in when password is incorrect", async () => {
      const wrongUser = {
        username: userData[1].username,
        password: "random123",
      };

      const { body: error } = await request(app)
        .post("/user/login")
        .send(wrongUser)
        .expect(400);

      expect(error.error).toBe("Wrong password");
    });
  });
});
