import { validationResult } from "express-validator";
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createDynamicUpdateQuery, toTitleCase } from "../../../utils/helper.js";
import { archiveLeadQuery, createLeadContactQuery, createLeadOfficeQuery, createLeadQuery, fetchLeadDetailQuery, fetchLeadTableListQuery, fetchLeadTableListUserQuery, updateLeadQuery } from "../model/leadQuery.js";
import { checkUserIdQuery } from "../../users/model/userQuery.js";

dotenv.config();

export const createLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { company_name, product, industry_type, export_value, insured_amount} = req.body;
        let user_id = req.params.id;
        company_name = toTitleCase(company_name);
        product = toTitleCase(product);

        const [lead_data] = await createLeadQuery([
            id,
            company_name,
            product,
            industry_type,
            export_value,
            insured_amount,
            user_id
        ]);

        return successResponse(res, {"lead_id": id}, 'Lead Created Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const addLeadOffices = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { lead_id, address, city, district, country, postal_code} = req.body;
        address = toTitleCase(address);
        city = toTitleCase(city);
        district = toTitleCase(district);
        country = toTitleCase(country);

        const [office_data] = await createLeadOfficeQuery([
            id,
            lead_id,
            address,
            city, 
            district,
            country,
            postal_code
        ]);

        return successResponse(res, office_data, 'Lead office added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const updateLead = async(req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        let table = 'leads';

        const condition = {
            id: id,
        };
        const req_data = req.body;
 
        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateLeadQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'Lead data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const updateLeadOffices = async(req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        const office_id = req.params.office_id;
        let table = 'lead_office';

        const condition = {
            id: office_id,
            lead_id: id,
        };
        const req_data = req.body;
 
        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateLeadQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'Lead data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const addLeadContact = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { lead_id, name, phone, alt_phone, email} = req.body;
        name = toTitleCase(name);
        let user_id = req.params.id;

        const [contact_data] = await createLeadContactQuery([
            id,
            lead_id,
            name,
            phone,
            alt_phone ?? null,
            email || '',
            user_id
        ]);

        return successResponse(res, contact_data, 'Lead contact added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const updateLeadContact = async(req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        const contact_id = req.params.contact_id;
        let table = 'lead_contact';

        const condition = {
            id: contact_id,
            lead_id: id,
        };
        const req_data = req.body;
 
        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateLeadQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'Lead data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const archiveLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let lead_id = req.params.lead_id;

        const [data] = await archiveLeadQuery([ lead_id ]);

        return successResponse(res, data, 'Lead archived Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchLeadTableDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let data;       
        const user_id = req.params.id
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if(isUserExist[0].role === 'admin'){
              [data] = await fetchLeadTableListQuery();
        }else{
            [data] = await fetchLeadTableListUserQuery([user_id]);
        }


        return successResponse(res, data, 'Lead table data fetched Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchLeadDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        const [data] = await fetchLeadDetailQuery([id]);

        return successResponse(res, data, 'Lead data fetched Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};