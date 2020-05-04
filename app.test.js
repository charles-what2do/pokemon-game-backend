const request = require("supertest");
const app = require("./app");

describe("App", () => {
  it("GET / should return JSON object of all endpoints", async () => {
    const { body } = await request(app).get("/");
    expect(body).toEqual({
      "0": "GET /",
      "1": "GET /user",
      "2": "POST /user/register",
      "3": "POST /user/login",
      "4": "POST /user/logout",
    });
  });
});
