import { validationResult } from "express-validator";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, minorErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createManagingBrandQuery, isCompanyBrandExistQuery, isCompanyBrandExistsTenantCreation } from "../../leads/model/leadQuery.js";
import { checkUserEmailQuery, getTenantIdQuery, userRegistrationQuery } from "../../users/model/userQuery.js";
import { toTitleCase } from "../../../utils/helper.js";
import { createTenant, getTenantNameQuery } from "../model/tenantQuery.js";
dotenv.config()

export const tenantRegistration = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "");
        }

        let {
            tenant_name,
            tenant_shortname,
            email
        } = req.body;

        let tenant_id;

        const [user_tenant_details] = await getTenantIdQuery([email]);
        if(user_tenant_details.length && !user_tenant_details[0].tenant_id){
            return errorResponse(res , '' , "Register user first ...!");
        }
        tenant_id = user_tenant_details[0].tenant_id;

        tenant_name = toTitleCase(tenant_name);

        tenant_shortname = toTitleCase(tenant_shortname);

        // check tenant is exists or not 

        const [tenant_details] = await getTenantNameQuery([tenant_name]);


        if(tenant_details.length > 0){
            return minorErrorResponse(res, "", "Tenant name is already exists");
        }

        const onboarding_status = true;

        // Create User linked to tenant
        await createTenant([
            tenant_name,
            tenant_shortname,
            onboarding_status
        ], tenant_id);

        return successResponse(res, "", "Tenant or Organization created successfully");

    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};
