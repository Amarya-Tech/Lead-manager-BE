import { validationResult } from "express-validator";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, minorErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createManagingBrandQuery, isCompanyBrandExistQuery } from "../../leads/model/leadQuery.js";
import { checkUserEmailQuery, userRegistrationQuery } from "../../users/model/userQuery.js";
import { toTitleCase } from "../../../utils/helper.js";
dotenv.config()

export const tenantRegistration = async (req , res , next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return errorResponse(res , errors.array() , "")
        }

        let { first_name , last_name , email , password , phone , parent_company_name , role} = req.body;
        let id = uuidv4();
        const company_name = toTitleCase(parent_company_name);

        const [isCompanyExist] = await isCompanyBrandExistQuery([company_name]);

        if (isCompanyExist.length > 0){
            return minorErrorResponse(res, '', "Managing Brand with same name exists")
        }

        const [company_data] = await createManagingBrandQuery([
            id,
            company_name
        ]);
        const tenant_id = id
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
            phone,
            role,
            tenant_id
        ]);
        return
        
    }catch(error){
        return internalServerErrorResponse(res , error);
    }
}