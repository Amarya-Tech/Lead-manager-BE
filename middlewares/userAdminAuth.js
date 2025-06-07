import dotenv from "dotenv"
import crypto from 'crypto-js';
import jwt from "jsonwebtoken"
import { getTokenSessionById } from "../utils/helper.js";
dotenv.config();

export const authenticateUserAdminSession  = async (req, res, next) => {

    const token = req.cookies.jwt
    const encrypted_user_id = req.headers['x-encryption-key'];
    if (!token) {
        return res.status(449).json({
            status: 'failure',
            message: 'Please send token in payload, x-access-token header, authorization header, or cookie.'
        });
    }

    if (!encrypted_user_id) {
        return res.status(449).json({
            status: 'failure',
            message: 'Critical parameter unresolved due to key omission.'
        });
    }
    try {
        let decoded, accessDetails, validAccess = false, jwtErrorMessage = '';
        let decrypted_user_id;
        try {
            const bytes = crypto.AES.decrypt(encrypted_user_id, process.env.ENCRYPTION_SECRET);
            decrypted_user_id = bytes.toString(crypto.enc.Utf8);
        } catch (decryptionError) {
            return res.status(440).json({
                status: 'failure',
                message: 'Data integrity compromised during key processing.'
            });
        }
        jwt.verify(token, process.env.JWT_SECRET, function (err, verifiedDetails) {
            if (err) {
                jwtErrorMessage = err.message;
            } else {
                decoded = verifiedDetails;
                if (String(decoded.user_id) === String(decrypted_user_id)) {
                validAccess = true;
            } else {
                jwtErrorMessage = 'User ID mismatch. Possible token misuse';
            }
            }
        });
        if (!validAccess) {
            return res.status(440).json({
                status: 'failure',
                message: `${jwtErrorMessage}, please login again.`
            });
        }
            //ACCESS DETAILS
            if (decoded.hasOwnProperty('user_id') && (decoded.role === "user" || decoded.role === "admin")) {
                [accessDetails] = await getTokenSessionById(decoded.user_id);
                
                if (accessDetails && String(token) === String(accessDetails[0].jwt_token)) {
                    req.decoded = decoded;
                    next();
                }else {
                    res.clearCookie('jwt', {
                        httpOnly: true,
                        sameSite: 'None',
                        secure: true,
                        path: '/',
                      });
                    res.clearCookie('user_id', {
                        httpOnly: true,
                        sameSite: 'None',
                        secure: true,
                        path: '/',
                      });
                    return res.send({
                        statusCode: 440,
                        status: 'failure',
                        message: 'Invalid session.'
                    });
                }
            }else {
                res.clearCookie('jwt', {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true,
                    path: '/',
                  });
                res.clearCookie('user_id', {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true,
                    path: '/',
                  });
                return res.send({
                    statusCode: 440,
                    status: 'failure',
                    message: 'Invalid token'
                });
            }       
    } catch (error) {
        console.log('----------AUTH:ERR FROM AUTH MIDDLEWARE----------', error);
        return res.send({
            statusCode: 440,
            status: 'failure',
            message: 'Token auth err'
        });
    }
}