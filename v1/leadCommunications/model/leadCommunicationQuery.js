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

export const addCommentToLeadQuery = (array)=> {
    try {
        let query = `INSERT INTO lead_communication_logs (
            id,
            lead_communication_id,
            created_by,
            comment
        ) VALUES (?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing addCommentToLeadQuery:", error);
        throw error;
    }
}