import { validationResult } from "express-validator";
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createDynamicUpdateQuery, toTitleCase } from "../../../utils/helper.js";
import { addAssigneeToLeadQuery, addCommentToLeadQuery, fetchLeadCommunicationDataQuery, fetchLogsQuery, isAssigneeExistQuery, isLeadExistQuery } from "../model/leadCommunicationQuery.js";


dotenv.config();

export const addAssigneeToLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { lead_id, assignee_id, description} = req.body;

        const [isLeadExist] = await isLeadExistQuery([lead_id])
        if(isLeadExist.length === 0){
            return notFoundResponse(res, [], 'Lead not found');
        }

        const [isAssigneeExist] = await isAssigneeExistQuery([assignee_id])
        if(isAssigneeExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        const [lead_data] = await addAssigneeToLeadQuery([
            id,
            lead_id,
            assignee_id,
            description
        ]);

        return successResponse(res, lead_data, 'Assignee added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const addComments = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        
        let { lead_communication_id, comment } = req.body;
        let user_id = req.params.id;

        const [isAssigneeExist] = await isAssigneeExistQuery([user_id])
        if(isAssigneeExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        const [lead_data] = await addCommentToLeadQuery([
            id,
            lead_communication_id,
            user_id,
            comment
        ]);

        return successResponse(res, lead_data, 'Comments added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const getLeadLogDetails = async (req, res, next) =>{
try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        
        let lead_id = req.params.lead_id;
        let user_id = req.params.id;
        
        const [lead_communication_data] = await fetchLeadCommunicationDataQuery([ lead_id, user_id])

        if(lead_communication_data.length == 0){
             return notFoundResponse(res, [], 'User has not established communication with that lead');
        }
        const [logs_data] = await fetchLogsQuery([lead_communication_data[0].id])
        
        return successResponse(res, logs_data, 'Comments fetched Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};