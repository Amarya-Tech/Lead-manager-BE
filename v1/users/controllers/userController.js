import jwt from "jsonwebtoken"
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import crypto from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse, unAuthorizedResponse } from "../../../utils/response.js";
import { checkUserEmailAndStatusQuery, checkUserEmailQuery, checkUserIdQuery, getAllActiveUsersQuery, getAllUsersForAmarya, getAllUsersQuery, getOtpByEmail, getStartedUserRegistration, getTenantIdQuery, insertOtpQuery, updateOtpForUserQuery, updateOtpQuery, updateTokenQuery, updateUserActiveStatusQuery, updateUserQuery, updateUserRoleQuery, userEmailVerificationQuery, userRegistrationQuery } from "../model/userQuery.js";
import { createDynamicUpdateQuery } from "../../../utils/helper.js";
import { sendMail } from "../../../utils/nodemailer.js";
import { initialTenantSetUp } from "../../tenant/controllers/tenantQuery.js";

dotenv.config();


export const verifyemail = async (req, res, next) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return errorResponse(res , errors.array() , "");
        }

        let {email , otp} = req.body;

        email = email.toLowerCase();
        const [user_otp] = await getOtpByEmail([email])
        
        if(user_otp.length === 0){
            return unAuthorizedResponse(res, '', 'User not found...!')
        }
        console.log("user otp fetched from db" , user_otp);
        console.log("otp from the frontend" , otp);
        if(otp?.toString() === user_otp[0].otp){
            await userEmailVerificationQuery([true , email]);
            return successResponse(res , '' , 'User email verified successfully');
        }else{
            return unAuthorizedResponse(res , '' ,'Invalid otp')
        }
    }catch(error){
        return internalServerErrorResponse(res , error)
    }
}

export const resendOtp = async (req, res, next) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return errorResponse(res , errors.array() , "");
        }

        let { email } = req.body;
        email = email.toLowerCase();

        const [existingUser] = await checkUserEmailQuery([email]);
        console.log("existing user value" , existingUser);
        if(existingUser.length){
            const is_verified = existingUser[0].is_email_verified;
            if(!is_verified){
                const otp = Math.floor(1000 + Math.random() * 9000) ;
                const [otpdata] = await updateOtpQuery([otp , email]);
                console.log("otp data" , otpdata);

                 if(otpdata.affectedRows === 0){
                    return errorResponse(res , '' , 'Sorry , something went wrong plase try after sometime');
                }else{
                    console.log(otp);
                    const data = await sendMail(email, `${otp} is the OTP for email verification. Enter the Otp to verify your e  mail!\n\n\n\nRegards,\nAmarya Business Consultancy`, 'Password Change Verification');
                    return successResponse(res, data, 'OTP for email verification has been sent successfully.');
                }
            }
        }else{
            return errorResponse(res , '' ,'User with this email not exist...!')
        }

    }catch(error){
        return internalServerErrorResponse(res , error)
    }
}

export const sendOtpForEmailVerification = async (req, res, next) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return errorResponse(res , errors.array() , "");
        }

        let { email } = req.body;

        email = email.toLowerCase();
        const id = uuidv4();

        const [existingUser] = await checkUserEmailAndStatusQuery([email]);
        console.log("existing user data" , existingUser);

        if(existingUser.length && !existingUser[0].is_email_verified){
            const otp = Math.floor(1000 + Math.random() * 9000) ;
            const [otpdata] = await updateOtpForUserQuery([otp , email]);
            console.log("otp data" , otpdata);
            if(otpdata.affectedRows === 0){
                return errorResponse(res , '' , 'Sorry , something went wrong plase try after sometime');
            }else{
                console.log(otp);
                const data = await sendMail(email, `${otp} is the OTP for email verification. Enter the Otp to verify your e  mail!\n\n\n\nRegards,\nAmarya Business Consultancy`, 'Password Change Verification');
                return successResponse(res, data, 'OTP for email verification has been sent successfully.');
            }
        }
        if(existingUser.length){
            return successResponse(res , [
                {
                    email : existingUser[0].email,
                    is_verified : existingUser[0].is_email_verified,
                    is_registerd : existingUser[0].is_registered,
                    onboarding_status : existingUser[0].onboarding_status
                }
            ] ,  'User or tenant with this email already exists');
        }
        // generating the four digit otp for the email verification
        const otp = Math.floor(1000 + Math.random() * 9000) ;
        const [otpdata] = await insertOtpQuery([id , email , otp]);
        console.log("otp data" , otpdata);
        if(otpdata.affectedRows === 0){
            return errorResponse(res , '' , 'Sorry , something went wrong plase try after sometime');
        }else{
            console.log(otp);
            const data = await sendMail(email, `${otp} is the OTP for email verification. Enter the Otp to verify your e  mail!\n\n\n\nRegards,\nAmarya Business Consultancy`, 'Password Change Verification');
            return successResponse(res, data, 'OTP for email verification has been sent successfully.');
        }
    }catch(error){
        return internalServerErrorResponse(res ,error);
    }
}
// initial user setupo for the new tenant registration

export const initialUserRegistration = async (req , res , next) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return errorResponse(res , errors.array() , "");
        }

        let {first_name, last_name, email, password, phone} = req.body

        const [user_tenant_details] = await getTenantIdQuery([email]);
        if(user_tenant_details.length && user_tenant_details[0].tenant_id){
            return errorResponse(res , '' , "User is already registered...!");
        }
        const tenant_id = uuidv4();
        const [tenant_data] = await initialTenantSetUp(tenant_id);
        email = email.toLowerCase();
        const is_registered = true;
        const password_hash = await bcrypt.hash(password.toString(), 12);

        const [user_data] = await getStartedUserRegistration([first_name , last_name , password_hash , phone , tenant_id , is_registered] , email);

        console.log("user data" , user_data);

        return successResponse(res , '' , 'User registration completed...!')

    }catch(error){
        return internalServerErrorResponse(res , error);
    }
}

export const userRegistration = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { first_name, last_name, email, password, phone, role } = req.body;
        let is_registered = true;
        email = email.toLowerCase();
        const tenant_id = req.tenant_id

        console.log("tenant id while user creation" , tenant_id);
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
            phone,
            is_registered,
            role
        ] , tenant_id);
        
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
        const [isUserExist] = await checkUserEmailQuery([email]);

        const [checkIsRegistrationSuccessfull] = await checkUserEmailAndStatusQuery([email]);

        if(checkIsRegistrationSuccessfull.length > 0 && (!checkIsRegistrationSuccessfull[0].is_email_verified || !checkIsRegistrationSuccessfull[0].is_registered || !checkIsRegistrationSuccessfull[0].onboarding_status)){
            return unAuthorizedResponse(res, '', 'Complete the registration or verification process then login');
        }

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
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,                  
            maxAge: parseInt(process.env.JWT_EXPIRATION_TIME) * 1000
        });

        res.cookie('user_id', isUserExist[0].id, {
            httpOnly: true,
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            path: '/',
            maxAge: parseInt(process.env.JWT_EXPIRATION_TIME) * 1000
        });

         res.cookie('role', isUserExist[0].role, {
            httpOnly: true,
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
            jwt:token,
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

export const fetchUserDetail = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }
        const user_id = req.params.id;
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist.length === 0) {
            return notFoundResponse(res, [], 'User not found');
        }

        return successResponse(res, isUserExist, `User role changed successfully`);
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const fetchActiveUsersList = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }
        const tenant_id = req.tenant_id
        const [user_data] = await getAllActiveUsersQuery(tenant_id);

        if (user_data.length === 0) {
            return notFoundResponse(res, [], 'List not found');
        }

        return successResponse(res, user_data, `List fetched successfully`);
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}


export const fetchUsersList = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }
        const company_name = req.company_name;
        const tenant_id = req.tenant_id
        let user_data = []

        console.log("tenant id for the fetchUsersList" , tenant_id);
        if(tenant_id){
            [user_data] = await getAllUsersQuery(tenant_id);
        }
        // if(company_name?.toLowerCase() === "amarya"){
        //     [user_data] = await getAllUsersForAmarya();
        // }else{
        //     [user_data] = await getAllUsersQuery(tenant_id);
        // }

        if (user_data.length === 0) {
            return notFoundResponse(res, [], 'List not found');
        }

        return successResponse(res, user_data, `List fetched successfully`);
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const updateUserData = async (req, res, next) => {
    try {
        const errors = validationResult(req);
       
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const user_id = req.params.id;
        let table = 'users';

        const condition = {
            id: user_id,
        };
        const req_data = req.body;

        if(req_data.password){
            req_data.password_hash = await bcrypt.hash(req_data.password.toString(), 12);
            delete req_data.password;
        }

        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateUserQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'User data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}