import pool from "../../../config/db.js"
import { v4 as uuidv4 } from 'uuid';

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
            state,
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
                    l.suitable_product,
                    lcom.assignee_id AS assignee_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS assigned_person, 
                    lcom.description AS assigned_description, 
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
                                'state', state,
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

                LEFT JOIN lead_communication AS lcom ON lcom.lead_id = l.id AND lcom.assignee_type = 'user'
                LEFT JOIN users AS u ON u.id = lcom.assignee_id

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
        const queryParams = [];

        let query = `
            SELECT *
            FROM (
                SELECT 
                    l.id AS id,
                    l.company_name,
                    l.product,
                    l.industry_type,
                    l.status,
                    logs.comment AS latest_comment,
                    DATE_FORMAT(logs.created_at, '%Y-%m-%d') AS latest_comment_date,
                    ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY logs.created_at DESC) AS rn
                FROM leads AS l
                LEFT JOIN lead_communication AS lcom 
                    ON lcom.lead_id = l.id
                LEFT JOIN lead_communication_logs AS logs 
                    ON logs.lead_communication_id = lcom.id
                WHERE l.is_archived = FALSE
        `;

        if (!is_admin) {
            query += ` AND lcom.assignee_id = ?`;
            queryParams.push(user_id);
        }

        query += `
            ) AS ranked
            WHERE rn = 1
            ORDER BY latest_comment_date DESC
        `;

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
    return pool.query(query);
  } catch (error) {
    console.error("Error executing fetchLeadIndustryQuery:", error);
    throw error;
  }
};

export const searchTermQuery = (searchTerm) => {
  try {
    const query = `
     SELECT id, 
            company_name, 
            product, 
            industry_type, 
            status, 
            DATE_FORMAT(created_at, '%Y-%m-%d') AS created_date FROM leads WHERE LOWER(company_name) LIKE LOWER(?) OR LOWER(industry_type) LIKE LOWER(?) AND is_archived = FALSE
    `;
    const value = `%${searchTerm.toLowerCase()}%`;
    const values = [value, value]; 
    return pool.query(query, values);
  } catch (error) {
    console.error("Error executing searchTermQuery:", error);
    throw error;
  }
};

export const searchLeadForLeadsPageQuery = (searchTerm, is_admin, user_id) => {
    try {
        const queryParams = [];

        let query = `
            SELECT *
            FROM (
                SELECT 
                    l.id AS id,
                    l.company_name,
                    l.product,
                    l.industry_type,
                    l.status,
                    logs.comment AS latest_comment,
                    DATE_FORMAT(logs.created_at, '%Y-%m-%d') AS latest_comment_date,
                    ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY logs.created_at DESC) AS rn
                FROM leads AS l
                LEFT JOIN lead_communication AS lcom 
                    ON lcom.lead_id = l.id
                LEFT JOIN lead_communication_logs AS logs 
                    ON logs.lead_communication_id = lcom.id
                WHERE LOWER(l.company_name) LIKE LOWER(?) OR LOWER(l.industry_type) LIKE LOWER(?) AND l.is_archived = FALSE
        `;

        const value = `%${searchTerm.toLowerCase()}%`;
        queryParams.push(value)
        queryParams.push(value)
        if (!is_admin) {
            query += ` AND lcom.assignee_id = ?`;
            queryParams.push(user_id);
        }

        query += `
            ) AS ranked
            WHERE rn = 1
            ORDER BY latest_comment_date DESC
        `;

        return pool.query(query, queryParams);
    } catch (error) {
        console.error("Error executing searchLeadForLeadsPageQuery:", error);
        throw error;
    }
};

export const insertAndFetchCompanyDataFromExcelQuery = async (data, created_by) => {
  try {
    const values = data.map(item => [
      uuidv4(),
      item.company_name,
      item.industry_type,
      created_by
    ]);

    const insertQuery = `
      INSERT INTO leads (id, company_name, industry_type, created_by)
      VALUES ?
    `;

    await pool.query(insertQuery, [values]);

    const fetchQuery = `
      SELECT * FROM leads WHERE created_by = ?
      ORDER BY created_at DESC LIMIT ?
    `;

    const [rows] = await pool.query(fetchQuery, [created_by, data.length]);

    return rows;

  } catch (error) {
    console.error("Error in insertAndFetchCompanyDataFromExcel:", error);
    throw error;
  }
};

export const insertOfficeDataFromExcelQuery = (data)=> {
    try {
        const filteredData = data.filter(item => item.address && item.address.trim() !== "");

        if (filteredData.length === 0) {
            console.log("No valid office data to insert.");
            return Promise.resolve([[], null]);
        }

        let query = `INSERT INTO lead_office (
            id,
            lead_id,
            address
        ) VALUES ?`

        const values = filteredData.map(item => [
            uuidv4(),                  
            item.lead_id,
            item.address               
        ]);
        return pool.query(query, [values]);
    } catch (error) {
        console.error("Error executing insertOfficeDataFromExcelQuery:", error);
        throw error;
    }
}

export const insertContactDataFromExcelQuery = (data, created_by)=> {
    try {
        const filteredData = data.filter(item => item.name && item.name.trim() !== "");

        if (filteredData.length === 0) {
            console.log("No valid contact data to insert.");
            return Promise.resolve([[], null]);
        }

        let query = `INSERT INTO lead_contact (
            id,
            lead_id,
            name,
            designation,
            phone,
            email,
            created_by
        ) VALUES ?`

        const values = filteredData.map(item => [
            uuidv4(),                  
            item.lead_id,
            item.name.trim(),
            item.designation?.trim() || null,
            item.phone && item.phone.trim() !== "" ? item.phone.trim() : null,
            item.email && item.email.trim() !== "" ? item.email.trim() : null,
            created_by               
        ]);
        return pool.query(query, [values]);
    } catch (error) {
        console.error("Error executing insertOfficeDataFromExcelQuery:", error);
        throw error;
    }
}