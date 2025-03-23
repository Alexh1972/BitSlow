import crypto from "crypto";
import jwt, {SignOptions} from "jsonwebtoken";

const SECRET_KEY = crypto.randomBytes(32).toString("hex");

export function generateToken(payload: object, expiresIn: number | string = "1h"): string {
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, SECRET_KEY, options);
}

export function verifyToken(token: string): object | null {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}