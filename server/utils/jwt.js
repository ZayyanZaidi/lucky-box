import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "secret_key";
export const generateToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: "7d" });
export const verifyToken = (token) => jwt.verify(token, SECRET);
