import { validationResult } from "express-validator";
import pool from "../../../config/db.js"
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createDynamicUpdateQuery, toTitleCase } from "../../../utils/helper.js";
import { addAssigneeToLeadQuery, addCommentToLeadQuery, fetchLogsQuery, isAssigneeExistQuery, isLeadExistQuery } from "../model/leadCommunicationQuery.js";


dotenv.config();

export const addAssigneeToLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        let user_id = req.params.id;
        let { lead_id, assignee_id, description} = req.body;

        const [isLeadExist] = await isLeadExistQuery([lead_id])
        if(isLeadExist.length === 0){
            return notFoundResponse(res, [], 'Lead not found');
        }

        const [isAssigneeExist] = await isAssigneeExistQuery([assignee_id])
        if(isAssigneeExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        const [lead_data] = await addAssigneeToLeadQuery([ lead_id, assignee_id ]);

        const addAssigneeData = {
            id: id,
            lead_id: lead_data.id,
            created_by: user_id,
            comment: `${isAssigneeExist[0].id} | ${isAssigneeExist[0].first_name + " "+ isAssigneeExist[0].last_name}`,
            action: 'ASSIGNED'
        }

       const [data] = await addCommentToLeadQuery([addAssigneeData.id, addAssigneeData.lead_id, addAssigneeData.created_by, addAssigneeData.comment, addAssigneeData.action])

       if(description){
        const addAssigneeData = {
            id: id,
            lead_id: lead_data.id,
            created_by: user_id,
            comment: description,
            action: 'COMMENT'
        }

        const [data] = await addCommentToLeadQuery([addAssigneeData.id, addAssigneeData.lead_id, addAssigneeData.created_by, addAssigneeData.comment, addAssigneeData.action])
       }

        return successResponse(res, data, 'Assignee added Successfully');
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
        let user_id = req.params.id;
        let { lead_id, assignee_id, description} = req.body;

        const [isLeadExist] = await isLeadExistQuery([lead_id])
        if(isLeadExist.length === 0){
            return notFoundResponse(res, [], 'Lead not found');
        }

        const [isAssigneeExist] = await isAssigneeExistQuery([assignee_id])
        if(isAssigneeExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        const [lead_data] = await addAssigneeToLeadQuery([lead_id, assignee_id]);

        const addAssigneeData = {
            id: id,
            lead_id: lead_data.id,
            created_by: user_id,
            comment: `${isAssigneeExist[0].id} | ${isAssigneeExist[0].first_name + " "+ isAssigneeExist[0].last_name}`,
            action: 'ASSIGNED'
        }
        const [data] = await addCommentToLeadQuery([addAssigneeData.id, addAssigneeData.lead_id, addAssigneeData.created_by, addAssigneeData.comment, addAssigneeData.action])

        if(description){
            const addAssigneeData = {
                id: id,
                lead_id: lead_data.id,
                created_by: user_id,
                comment: description,
                action: 'COMMENT'
            }
            const [data] = await addCommentToLeadQuery([addAssigneeData.id, addAssigneeData.lead_id, addAssigneeData.created_by, addAssigneeData.comment, addAssigneeData.action])
        }

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
        
        let { comment, action, action_date } = req.body;
        let user_id = req.params.id;
        let lead_id = req.params.lead_id;

        const [isAssigneeExist] = await isAssigneeExistQuery([user_id])
        if(isAssigneeExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        if(action == undefined || action == "" || action == null){
            action = 'COMMENT'
        }
        if(action == 'FOLLOW_UP' && action_date == undefined){
            return errorResponse(res, [], "Date is not present, without date followup cannot be locked.")
        }
        const [lead_data] = await addCommentToLeadQuery([
            id,
            lead_id,
            user_id,
            comment, 
            action,
            action_date || null
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
        
        const { query, values } = fetchLogsQuery(lead_id);
        const [rows] = await pool.query(query, values);

        return successResponse(res, rows, 'Comments fetched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};