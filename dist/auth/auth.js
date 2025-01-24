"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shield = exports.comparePassword = exports.generateToken = exports.hashPassword = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
require("dotenv/config");
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const generateToken = (user) => {
    const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return token;
};
exports.generateToken = generateToken;
const comparePassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const shield = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = bearer.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized or Not a valid token' });
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = user;
        next();
    }
    catch (error) {
        res.json(error);
    }
};
exports.shield = shield;
