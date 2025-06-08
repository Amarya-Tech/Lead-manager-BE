import jwt from "jsonwebtoken"
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import crypto from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { checkUserEmailQuery, checkUserIdQuery, updateTokenQuery, updateUserActiveStatusQuery, updateUserRoleQuery, userRegistrationQuery } from "../model/userQuery.js";

dotenv.config();

export const userRegistration = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { first_name, last_name, email, password, phone } = req.body;
        email = email.toLowerCase();
        const [existingUser] = await checkUserEmailQuery([email]);
         if (existingUser.length) {
            return errorResponse(res, '', 'User with this email already exists.');
        }

        const password_hash = await bcrypt.hash(password.toString(), 12);

        const [user_data] = await userRegistrationQuery([
            id,
            first_name,
            last_name,
            email,
            password_hash,
            phone
        ]);
        
        return successResponse(res, user_data, 'User successfully registered');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const userLogin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }

        const isProduction = process.env.NODE_ENV === 'production';

        const { email, password } = req.body;
        const [isUserExist] = await checkUserEmailQuery([email]);;

        if (isUserExist.length === 0) {
            return notFoundResponse(res, [], 'User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, isUserExist[0].password_hash);
        const user_id = isUserExist[0].id;
        if (!isPasswordValid) {
            return unAuthorizedResponse(res, '', 'Authentication failed');
        }

        const encrypted_user_id = crypto.AES.encrypt(user_id.toString(), process.env.ENCRYPTION_SECRET).toString();
        const token = jwt.sign({
            user_id: user_id,
            name: isUserExist[0].first_name,
            role: isUserExist[0].role,
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION_TIME,
        });

        await updateTokenQuery([token, user_id]);
        // Set JWT and user_id as HttpOnly and SameSite=Strict cookies
        res.cookie('jwt', token, {
            httpOnly: false,
            sameSite: isProduction ? 'None' : 'Lax', // 'None' for prod HTTPS, 'Lax' for dev
            secure: isProduction,                    // true in prod HTTPS, false in dev
            maxAge: parseInt(process.env.JWT_EXPIRATION_TIME) * 1000
        });

        res.cookie('user_id', isUserExist[0].id, {
            httpOnly: false,
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            path: '/',
            maxAge: parseInt(process.env.JWT_EXPIRATION_TIME) * 1000
        });
        res.setHeader('x-encryption-key', encrypted_user_id);
        console.log(encrypted_user_id);
        return successResponse(res, [{
            user_id: isUserExist[0].id,
            user_name: isUserExist[0].username,
            role: isUserExist[0].role,
            full_name: isUserExist[0].first_name + ' ' + isUserExist[0].last_name
        }], 'You are successfully logged in');

    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const userLogout = async (req, res, next) => {
    try {
        const user_id = req.params.id;
        await updateTokenQuery(["", user_id]);
        if(user_id){
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
        }
        return successResponse(res, '', `You have successfully logged out!`);
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const setUserStatus = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }
        const { id, is_active } = req.body;
        const [isUserExist] = await checkUserIdQuery([id]);;

        if (isUserExist.length === 0) {
            return notFoundResponse(res, [], 'User not found');
        }

        const data = await updateUserActiveStatusQuery([is_active, id])

        if(data[0].affectedRows === 0){
            return errorResponse(res, [], "Data Not updated")
        }

        return successResponse(res, data, `User active status changed successfully`);
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const changeUserRole = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }
        const { id, role } = req.body;
        const [isUserExist] = await checkUserIdQuery([id]);;

        if (isUserExist.length === 0) {
            return notFoundResponse(res, [], 'User not found');
        }

        if(role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'user'){
            return errorResponse(res, "", "This Role doesn't exists");
        }

        const data = await updateUserRoleQuery([role, id])

        if(data[0].affectedRows === 0){
            return errorResponse(res, [], "Data Not updated")
        }

        return successResponse(res, data, `User role changed successfully`);
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}