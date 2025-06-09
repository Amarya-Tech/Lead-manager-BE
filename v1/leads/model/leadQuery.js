import pool from "../../../config/db.js"

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
            phone,
            alt_phone,
            email,
            created_by
        ) VALUES (?,?,?,?,?,?,?)`
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
                                'country', country
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