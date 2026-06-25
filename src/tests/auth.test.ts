import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";

afterEach(async () => {
    await db.delete(users);
});

describe("POST /auth/register", () => {
    it("should create a new user", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "John",
            email: "john@test.com",
            password: "password123",
        });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User created");
    });

    it("should reject missing fields", async () => {
        const res = await request(app).post("/auth/register").send({
            email: "john@test.com",
        });
        expect(res.status).toBe(400);
    });

    it("should reject duplicate email", async () => {
        await request(app).post("/auth/register").send({
            name: "John",
            email: "john@test.com",
            password: "password123",
        });

        const res = await request(app).post("/auth/register").send({
            name: "John",
            email: "john@test.com",
            password: "password123",
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("User exists");
    });
});

describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
        await request(app).post("/auth/register").send({
            name: "John",
            email: "john@test.com",
            password: "password123",
        });

        const res = await request(app).post("/auth/login").send({
            email: "john@test.com",
            password: "password123",
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("User logged in.");
    });

    it("should reject wrong password", async () => {
        await request(app).post("/auth/login").send({
            name: "John",
            email: "john@test.com",
            password: "password123",
        });

        const res = await request(app).post("/auth/login").send({
            email: "john@test.com",
            password: "wrongpassword",
        });
        expect(res.status).toBe(404);
    });

    it("should reject non existent user", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "nobody@test.com",
            password: "password123",
        });
        expect(res.status).toBe(404);
    });
});