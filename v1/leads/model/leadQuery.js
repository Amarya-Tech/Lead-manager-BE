import pool from "../../../config/db.js"
import { v4 as uuidv4 } from 'uuid';

// export const checkUserEmailQuery = (array)=>{
//     try {
//         let query = `SELECT * FROM users WHERE email = ?`
//         return pool.query(query, array);
//     } catch (error) {
//         console.error("Error executing checkUserEmailQuery:", error);
//         throw error;
//     }
// }

export const createLeadQuery = (array)=> {
    try {
        let query = `INSERT INTO leads (
            id,
            company_name,
            product,
            industry_type,
            export_value,
            insured_amount,
            created_by
        ) VALUES (?,?,?,?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing createLeadQuery:", error);
        throw error;
    }
}


export const createLeadOfficeQuery = (array)=> {
    try {
        let query = `INSERT INTO lead_office (
            id,
            lead_id,
            address,
            city,
            district,
            country,
            postal_code
        ) VALUES (?,?,?,?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing createLeadOfficeQuery:", error);
        throw error;
    }
}

export const updateLeadQuery = async (query,array) => {
    try {
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing updateLeadQuery:", error);
        throw error;
    }
}

export const createLeadContactQuery = (array)=> {
    try {
        let query = `INSERT INTO lead_contact (
            id,
            lead_id,
            name,
            designation,
            phone,
            alt_phone,
            email,
            created_by
        ) VALUES (?,?,?,?,?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing createLeadContactQuery:", error);
        throw error;
    }
}

export const archiveLeadQuery = (array) => {
    try{
        let query = `UPDATE leads SET is_archived = TRUE WHERE id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing archiveLeadQuery:", error);
        throw error;
    }
}

export const fetchLeadTableListQuery = () => {
    try{
        let query = `SELECT id, company_name, 
        product, 
        industry_type, 
        status, 
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_date
        FROM leads WHERE is_archived = FALSE`
        return pool.query(query);
    } catch (error) {
        console.error("Error executing fetchLeadTableListQuery:", error);
        throw error;
    }
}

export const fetchLeadTableListUserQuery = (array) => {
    try{
        let query = `SELECT l.id, 
                l.company_name, 
                l.product, 
                l.industry_type, 
                l.status, 
                DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date
            FROM leads l
            WHERE l.is_archived = FALSE
            AND l.id IN (
                SELECT lc.lead_id
                FROM lead_communication lc
                WHERE lc.assignee_id = ?
            )`          
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing fetchLeadTableListQuery:", error);
        throw error;
    }
}

export const fetchLeadDetailQuery = (array) => {
    try{
        const query = `SELECT 
                    l.id, 
                    l.company_name, 
                    l.product, 
                    l.industry_type, 
                    l.export_value, 
                    l.insured_amount, 
                    l.status, 
                    DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                    COALESCE(office_data.office_details, JSON_ARRAY()) AS office_details,
                    COALESCE(contact_data.contact_details, JSON_ARRAY()) AS contact_details
                FROM leads AS l

                LEFT JOIN (
                    SELECT 
                        lead_id,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'office_id', id,
                                'address', address,
                                'city', city,
                                'district', district,
                                'country', country,
                                'postal_code', postal_code
                            )
                        ) AS office_details
                    FROM lead_office
                    GROUP BY lead_id
                ) AS office_data ON office_data.lead_id = l.id

                LEFT JOIN (
                    SELECT 
                        lead_id,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'contact_id', id,
                                'name', name,
                                'designation', designation,
                                'phone', phone,
                                'alt_phone', alt_phone,
                                'email', email
                            )
                        ) AS contact_details
                    FROM lead_contact
                    GROUP BY lead_id
                ) AS contact_data ON contact_data.lead_id = l.id

                WHERE l.is_archived = FALSE 
                AND l.id = ?;

                `
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing fetchLeadDetailQuery:", error);
        throw error;
    }
}

export const fetchLeadListWithLastContactedQuery = (is_admin, user_id) => {
    try {
        let query = `
            SELECT 
                l.id AS lead_id,
                l.company_name,
                l.product,
                l.industry_type,
                l.status,
                lcom.id AS lead_communication_id,
                logs.comment AS latest_comment,
                DATE_FORMAT(logs.created_at, '%Y-%m-%d') AS latest_comment_date
            FROM leads AS l
            LEFT JOIN lead_communication AS lcom 
                ON lcom.lead_id = l.id
            LEFT JOIN lead_communication_logs AS logs 
                ON logs.id = (
                    SELECT logs2.id 
                    FROM lead_communication_logs AS logs2
                    WHERE logs2.lead_communication_id = lcom.id
                    ORDER BY logs2.created_at DESC
                    LIMIT 1
                )
            WHERE l.is_archived = FALSE
        `;

        const queryParams = [];

        if (!is_admin) {
            query += ` AND lcom.assignee_id = ?`;
            queryParams.push(user_id);
        }

        query += ` ORDER BY l.created_at DESC`;

        return pool.query(query, queryParams);
    } catch (error) {
        console.error("Error executing fetchLeadListWithLastContactedQuery:", error);
        throw error;
    }
};

export const insertLeadIndustries = (industryNamesArray) => {
  try {
    const query = `
      INSERT INTO lead_industry (id, industry_name)
      VALUES ?
    `;

    const formattedValues = industryNamesArray.map(name => [uuidv4(), name]);

    return pool.query(query, [formattedValues]);
  } catch (error) {
    console.error("Error executing insertLeadIndustries:", error);
    throw error;
  }
};

export const fetchLeadIndustryQuery = () => {
  try {
    const query = `
     SELECT id, industry_name FROM lead_industry 
     ORDER BY industry_name ASC
    `;
    return pool.query(query, );
  } catch (error) {
    console.error("Error executing fetchLeadIndustryQuery:", error);
    throw error;
  }
};