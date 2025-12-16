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


export const addAssigneeToLeadQuery = async ([leadId, assigneeId]) => {
  try {
    const query = `
      UPDATE leads
      SET assignee = ?
      WHERE id = ?
    `;
    await pool.query(query, [assigneeId, leadId]);

    const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [leadId]);

    return rows;
  } catch (error) {
    console.error("Error executing addAssigneeToLeadQuery:", error);
    throw error;
  }
};

export const addCommentToLeadQuery = ([id, lead_id, created_by, comment, action, action_date]) => {
    try {
        let query = "";
        let values = [];

        if (action === 'FOLLOW_UP') {
            query = `
                INSERT INTO lead_logs (
                    id,
                    lead_id,
                    created_by,
                    comment,
                    action,
                    action_date
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            values = [id, lead_id, created_by, comment, action, action_date];
        } else {
            query = `
                INSERT INTO lead_logs (
                    id,
                    lead_id,
                    created_by,
                    comment,
                    action
                ) VALUES (?, ?, ?, ?, ?)
            `;
            values = [id, lead_id, created_by, comment, action];
        }

        return pool.query(query, values);
    } catch (error) {
        console.error("Error executing addCommentToLeadQuery:", error);
        throw error;
    }
};

export const fetchLogsQuery = (id) => {
    try {
        const query = `
            SELECT 
                logs.id,
                logs.lead_id,
                logs.created_by,
                CONCAT(u.first_name, ' ', u.last_name) AS created_by_name,
                logs.comment,
                logs.action,
                logs.action_date,
                logs.created_at AS created_date
            FROM lead_logs AS logs
            JOIN users AS u ON u.id = logs.created_by
            WHERE logs.lead_id = ?
            ORDER BY logs.created_at DESC
        `;
        return { query, values: [id] };
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
        const updatePromises = filteredData.map(item => {
            const updateQuery = `
                UPDATE leads
                SET assignee = ?
                WHERE id = ?
            `;
            return pool.query(updateQuery, [item.assignee_id.trim(), item.lead_id]);
        });

        await Promise.all(updatePromises);

        const fetchQuery = `
            SELECT * FROM leads
            ORDER BY updated_at DESC LIMIT ?
        `;
        const [rows] = await pool.query(fetchQuery, [filteredData.length]);

        return rows;
    } catch (error) {
        console.error("Error executing insertAssigneeDataFromExcelQuery:", error);
        throw error;
    }
}

export const updateAssigneeDataQuery = async (assigneeUpdateData) => {
    try{
        const assigneeId = assigneeUpdateData.assignee_id && assigneeUpdateData.assignee_id.trim();
        if(!assigneeId){
            return [];
        }

        const updateQuery = `
                UPDATE leads
                SET assignee = ?
                WHERE id = ?
            `;
        return pool.query(updateQuery, [assigneeUpdateData.assignee_id.trim(), assigneeUpdateData.lead_id]);

    }catch(error){
        console.error("Error in executing updateAssigneeDataQuery:", error);
        throw error;
    }
}

export const insertAssigneeActionFromExcelQuery = async(data)=> {
    try {
        const values = data.map(item => [
            uuidv4(),
            item.lead_id,
            item.user_id,
            item.comment,
            item.action
        ]);

        const insertQuery = `INSERT INTO lead_logs (id, lead_id, created_by, comment, action) VALUES ?`;

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
        
        let query = `INSERT INTO lead_logs (
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