import pool from "../../../config/db.js"
import { v4 as uuidv4 } from 'uuid';

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
            assignee_type,
            description
        ) VALUES (?,?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing addAssigneeToLeadQuery:", error);
        throw error;
    }
}

export const updateAssigneeToLeadQuery = async ([assignee_id, lead_id, description, assignee_type ]) => {
    try {
        const [rows] = await pool.query(
            'SELECT id FROM lead_communication WHERE lead_id = ?',
            [lead_id]
        );

        if (rows.length > 0) {
            return pool.query(
                'UPDATE lead_communication SET assignee_id = ? WHERE lead_id = ?',
                [assignee_id, lead_id]
            );
        } else {
            return pool.query(
                'INSERT INTO lead_communication (id, lead_id, assignee_id, assignee_type, description) VALUES (?, ?, ?, ?, ?)',
                [ uuidv4(), lead_id, assignee_id, assignee_type, description ]
            );
        }
    } catch (error) {
        console.error("Error in updateAssigneeToLeadQuery:", error);
        throw error;
    }
};


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

export const insertAssigneeDataFromExcelQuery = async(data)=> {
    try {
        const filteredData = data.filter(item => 
            item.assignee_id && item.assignee_id.trim() !== ""
        );

        if (filteredData.length === 0) {
            return [];
        }
        const values = filteredData.map(item => [
            uuidv4(),                  
            item.lead_id,
            item.assignee_id  && item.assignee_id.trim() !== "" ? item.assignee_id.trim() : null,              
            item.assignee_type && item.assignee_type.trim() !== "" ? item.assignee_type.trim() : null,              
            'Auto assigned from bulk import'          
        ]);

        const insertQuery = `INSERT INTO lead_communication (id, lead_id, assignee_id, assignee_type, description) VALUES ?`;

        await pool.query(insertQuery, [values]);

         const fetchQuery = `
            SELECT * FROM lead_communication
            ORDER BY created_at DESC LIMIT ?
        `;

        const [rows] = await pool.query(fetchQuery, [filteredData.length]);

        return rows;
    } catch (error) {
        console.error("Error executing insertAssigneeDataFromExcelQuery:", error);
        throw error;
    }
}

export const insertAssigneeActionFromExcelQuery = async(data)=> {
    try {
        const values = data.map(item => [
            uuidv4(),                  
            item.lead_communication_id,
            item.user_id,              
            item.comment,              
            item.action             
        ]);

        const insertQuery = `INSERT INTO lead_communication_logs (id, lead_communication_id, created_by, comment, action) VALUES ?`;

        return await pool.query(insertQuery, [values]);
    } catch (error) {
        console.error("Error executing insertAssigneeActionFromExcelQuery:", error);
        throw error;
    }
}

export const addCommentToLeadUsingExcelQuery = async (data)=> {
    try {
        const [id, leadCommId, createdBy, comment, action, dateStr] = data;
        const [day, month, year] = dateStr.split("/");

        const formattedDate = `${year}-${month}-${day} 00:00:00`;
        
        let query = `INSERT INTO lead_communication_logs (
            id,
            lead_communication_id,
            created_by,
            comment,
            action,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`

        const values = [id, leadCommId, createdBy, comment, action, formattedDate]
        return await pool.query(query, values);
    } catch (error) {
        console.error("Error executing addCommentToLeadUsingExcelQuery:", error);
        throw error;
    }
}