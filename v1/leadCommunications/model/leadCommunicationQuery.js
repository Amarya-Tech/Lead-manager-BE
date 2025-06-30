import pool from "../../../config/db.js"

export const isLeadExistQuery = (array)=>{
    try {
        let query = `SELECT * FROM leads WHERE id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing isLeadExistQuery:", error);
        throw error;
    }
}

export const isAssigneeExistQuery = (array)=>{
    try {
        let query = `SELECT * FROM users WHERE id = ? AND is_active = TRUE`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing isAssigneeExistQuery:", error);
        throw error;
    }
}

export const addAssigneeToLeadQuery = (array)=> {
    try {
        let query = `INSERT INTO lead_communication (
            id,
            lead_id,
            assignee_id,
            description
        ) VALUES (?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing addAssigneeToLeadQuery:", error);
        throw error;
    }
}

export const updateAssigneeToLeadQuery = (array)=> {
    try {
        let query = `UPDATE lead_communication SET assignee_id = ? WHERE lead_id =?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing updateAssigneeToLeadQuery:", error);
        throw error;
    }
}

export const addCommentToLeadQuery = (array)=> {
    try {
        let query = `INSERT INTO lead_communication_logs (
            id,
            lead_communication_id,
            created_by,
            comment,
            action
        ) VALUES (?,?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing addCommentToLeadQuery:", error);
        throw error;
    }
}

export const fetchLeadCommunicationDataQuery = (array)=>{
    try {
        let query = `SELECT * FROM lead_communication WHERE lead_id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing fetchLeadCommunicationDataQuery:", error);
        throw error;
    }
}

export const fetchLogsQuery = (ids)=>{
    try {
       const placeholders = ids.map(() => '?').join(', ');
        const query = `
            SELECT 
                logs.id,
                logs.lead_communication_id,
                logs.created_by,
                CONCAT(u.first_name, ' ', u.last_name) AS created_by_name,
                logs.comment,
                logs.action,
                logs.created_at AS created_date
            FROM lead_communication_logs AS logs
            JOIN users AS u ON u.id = logs.created_by
            WHERE logs.lead_communication_id IN (${placeholders})
            ORDER BY logs.created_at DESC
        `;
        return { query, values: ids };
    } catch (error) {
        console.error("Error executing fetchLogsQuery:", error);
        throw error;
    }
}

export const isLeadCommunicationIdExistQuery = (array)=>{
    try {
        let query = `SELECT * FROM lead_communication WHERE lead_id = ? AND assignee_id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing isLeadCommunicationIdExistQuery:", error);
        throw error;
    }
}
