import { validationResult } from "express-validator";
import pool from "../../../config/db.js"
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createDynamicUpdateQuery, toTitleCase } from "../../../utils/helper.js";
import { addAssigneeToLeadQuery, addCommentToLeadQuery, fetchLeadCommunicationDataQuery, fetchLogsQuery, isAssigneeExistQuery, isLeadCommunicationIdExistQuery, isLeadExistQuery, updateAssigneeToLeadQuery } from "../model/leadCommunicationQuery.js";


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
            'user',
            description
        ]);

        return successResponse(res, lead_data, 'Assignee added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const updateAssigneeToLead = async (req, res, next) => {
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

        const [lead_data] = await updateAssigneeToLeadQuery([assignee_id, lead_id]);

        return successResponse(res, lead_data, 'Assignee updated Successfully');
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
        let com_id = uuidv4();
        
        let { comment, action } = req.body;
        let lead_communication_id;
        let description;
        let user_id = req.params.id;
        let lead_id = req.params.lead_id;

        const [isAssigneeExist] = await isAssigneeExistQuery([user_id])
        if(isAssigneeExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        const [isLeadCommunicationIdExist] = await isLeadCommunicationIdExistQuery([lead_id, user_id])
        
        if(isLeadCommunicationIdExist.length == 0){
            await addAssigneeToLeadQuery([
                com_id,
                lead_id,
                user_id,
                isAssigneeExist[0].role,
                description || ""
            ]);

            const [data] = await isLeadCommunicationIdExistQuery([lead_id, user_id])

            lead_communication_id= data[0].id
        }else{   
            lead_communication_id = isLeadCommunicationIdExist[0].id
        }

        if(action == undefined || action == "" || action == null){
            action = 'COMMENT'
        }
        const [lead_data] = await addCommentToLeadQuery([
            id,
            lead_communication_id,
            user_id,
            comment, 
            action
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
        
         const [lead_communication_data] = await fetchLeadCommunicationDataQuery([lead_id]);

        if (!lead_communication_data || lead_communication_data.length === 0) {
            return successResponse(res, [], 'No communication records found for this lead');
        }

        const communicationIds = lead_communication_data.map(item => item.id);

        const { query, values } = fetchLogsQuery(communicationIds);
        const [logs_data] = await pool.query(query, values);

        const sortedLogs = logs_data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return successResponse(res, sortedLogs, 'Comments fetched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};