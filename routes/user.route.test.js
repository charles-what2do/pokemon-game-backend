const request = require("supertest");
const app = require("../app");

const { teardownMongoose } = require("../utils/testTeardownMongoose");
const userData = require("../data/testUserData");
const User = require("../models/user.model");

const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");

describe("User Route", () => {
  let signedInAgent;

  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await User.create(userData);
    signedInAgent = request.agent(app);
    await signedInAgent.post("/api/user/login").send(userData[0]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await User.deleteMany();
  });

  describe("/user/register", () => {
    it("POST /user/register should add a user and return a new user object", async () => {
      const expectedUser = {
        username: "aberkhoo",
        password: "123456789",
      };

      const { body: actualUser } = await request(app)
        .post("/api/user/register")
        .send(expectedUser)
        .expect(200);

      expect(actualUser.username).toBe(expectedUser.username.toLowerCase());
      expect(actualUser.password).not.toBe(expectedUser.password);
    });

    it("POST /user/register should return 400 bad erquest error message when request is invalid", async () => {
      const { body: error } = await request(app)
        .post("/api/user/register")
        .send({ badRequest: "" })
        .expect(400);

      expect(error.error).toBe("Invalid inputs");
    });

    it("POST /user/register with name less than 3 characters will give 400 error", async () => {
      const { body: error } = await request(app)
        .post("/api/user/register")
        .send({ username: "tt", password: "123456789" })
        .expect(400);

      expect(error.error).toBe("Invalid inputs");
    });

    it("POST /user/register with password less than 8 characters will give 400 error", async () => {
      const { body: error } = await request(app)
        .post("/api/user/register")
        .send({ username: "test", password: "1234567" })
        .expect(400);

      expect(error.error).toBe("Invalid inputs");
    });
  });

  describe("/user/login", () => {
    it("POST /user/login should login user if username and password is correct", async () => {
      const loginUser = {
        username: userData[1].username,
        password: userData[1].password,
      };

      const { text: message } = await request(app)
        .post("/api/user/login")
        .send(loginUser)
        .expect("set-cookie", /token=.*; Path=\/; Expires=.* HttpOnly/)
        .expect(200);

      expect(message).toEqual("You are logged in");
    });

    it("POST /user/login should not log user in when password is incorrect", async () => {
      const wrongUser = {
        username: userData[1].username,
        password: "random123",
      };

      const { body: error } = await request(app)
        .post("/api/user/login")
        .send(wrongUser)
        .expect(400);

      expect(error.error).toBe("Wrong password");
    });
  });

  describe("/user/logout", () => {
    it("POST /user/logout should logout and clear cookie", async () => {
      const response = await request(app).post("/api/user/logout").expect(200);
      expect(response.text).toBe("You have been logged out");
      expect(response.headers["set-cookie"][0]).toMatch(/^token=/);
    });
  });

  describe("/user", () => {
    it("GET /user should return user information using user id from token", async () => {
      const userIndex = 1;
      const { password, records, ...expectedUserInformation } = userData[
        userIndex
      ];

      jwt.verify.mockReturnValueOnce({
        userid: userData[userIndex].id,
        username: userData[userIndex].username,
      });

      const { body: actualUser } = await signedInAgent
        .get("/api/user/")
        .expect(200);

      expect(jwt.verify).toBeCalledTimes(1);
      expect(actualUser).toMatchObject(expectedUserInformation);
    });

    it("GET /user should return 401 unathorized when token is invalid", async () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("token not valid");
      });

      const { body: error } = await signedInAgent.get("/api/user").expect(401);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(error.error).toBe("You are not authorized");
    });
  });

  describe("/user/records", () => {
    it("GET /user/records should return user records using user id from token", async () => {
      const userIndex = 1;
      const { records, ...otherUserInformation } = userData[userIndex];

      jwt.verify.mockReturnValueOnce({
        userid: userData[userIndex].id,
        username: userData[userIndex].username,
      });

      const { body: actualRecords } = await signedInAgent
        .get("/api/user/records")
        .expect(200);

      expect(jwt.verify).toBeCalledTimes(1);
      expect(actualRecords).toMatchObject(records);
    });

    it("GET /user/records should return 401 unathorized when token is invalid", async () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("token not valid");
      });

      const { body: error } = await signedInAgent
        .get("/api/user/records")
        .expect(401);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(error.error).toBe("You are not authorized");
    });

    it("POST /user/records should add a record using user id from token and return updated record", async () => {
      const record = {
        recordType: "WIN",
        recordTime: 400,
      };

      jwt.verify.mockReturnValueOnce({
        userid: userData[0].id,
        username: userData[0].username,
      });

      const { body: updatedRecord } = await signedInAgent
        .post("/api/user/records")
        .send(record)
        .expect(201);

      expect(jwt.verify).toBeCalledTimes(1);
      expect(updatedRecord).toMatchObject(record);
    });

    it("POST /user/records should return 401 unathorized when token is invalid", async () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("token not valid");
      });

      const { body: error } = await signedInAgent
        .post("/api/user/records")
        .expect(401);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(error.error).toBe("You are not authorized");
    });
  });
});
