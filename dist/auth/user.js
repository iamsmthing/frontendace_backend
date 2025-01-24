"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = exports.createNewUser = void 0;
const drizzle_1 = require("../db/drizzle");
const schema_1 = require("../db/schema/schema");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("./auth");
const createNewUser = async (req, res) => {
    const checkIfUserExists = await drizzle_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, req.body.email));
    if (checkIfUserExists.length > 0) {
        return res.status(400).json({ message: "User already exists" });
    }
    try {
        const { email, password, username, imageUrl } = req.body;
        const hash = await (0, auth_1.hashPassword)(password);
        const user = await drizzle_1.db.insert(schema_1.users).values({ id: (0, uuid_1.v4)(), username, email, password: hash, imageUrl }).returning();
        const token = (0, auth_1.generateToken)({ id: user[0].id });
        console.log(token);
        const data = {
            id: user[0].id,
            username: user[0].username,
            email: user[0].email,
            imageUrl,
            token
        };
        return res.json(data);
    }
    catch (error) {
        console.log(error);
        res.json(error);
    }
};
exports.createNewUser = createNewUser;
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await drizzle_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = (0, auth_1.generateToken)({ id: user[0].id });
        const data = {
            id: user[0].id,
            username: user[0].username,
            email: user[0].email,
            imageUrl: user[0].imageUrl,
            token
        };
        return res.json(data);
    }
    catch (error) {
        return res.status(500).json(error);
    }
};
exports.signIn = signIn;
