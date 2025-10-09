import pool from "../../../config/db.js"
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv"

export const createLeadQuery = async (array)=> {
    try {
        let query = `INSERT INTO leads (
            id,
            company_name,
            parent_company_id,
            product,
            industry_type,
            export_value,
            insured_amount,
            created_by
        ) VALUES (?,?,?,?,?,?,?,?)`

        const [insertResult] = await pool.query(query, array);

        const insertedId = array[0];
        const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [insertedId]);

        return rows;
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

export const fetchLeadTableListQuery = (parentCompanyId = null) => {
    try {
        let query = `
      SELECT 
        l.id, 
        l.company_name, 
        l.product, 
        l.industry_type, 
        l.status, 
        DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
        c.parent_company_name AS parent_company_name
      FROM leads l 
      LEFT JOIN users u ON u.id = l.assignee
      LEFT JOIN companies AS c ON c.id = l.parent_company_id
      WHERE l.is_archived = FALSE
    `;

        const params = [];

        if (parentCompanyId) {
            query += ` AND l.parent_company_id = ?`;
            params.push(parentCompanyId);
        }

        query += ` ORDER BY l.created_at DESC;`;

        return pool.query(query, params);
    } catch (error) {
        console.error("Error executing fetchLeadTableListQuery:", error);
        throw error;
    }
};

export const fetchLeadTableListUserQuery = (userId, parentCompanyId = null) => {
    try {
        let query = `
      SELECT 
        l.id, 
        l.company_name, 
        l.product, 
        l.industry_type, 
        l.status, 
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,  
        DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
        c.parent_company_name AS parent_company_name
      FROM leads l
      LEFT JOIN users AS u ON u.id = l.assignee
      LEFT JOIN companies AS c ON c.id = l.parent_company_id
      WHERE l.is_archived = FALSE 
        AND l.assignee = ?
    `;

        const params = [userId];

        if (parentCompanyId) {
            query += ` AND l.parent_company_id = ?`;
            params.push(parentCompanyId);
        }

        query += ` ORDER BY l.created_at DESC;`;

        return pool.query(query, params);
    } catch (error) {
        console.error("Error executing fetchLeadTableListUserQuery:", error);
        throw error;
    }
};

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
                    l.assignee AS assignee_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS assigned_person, 
                    DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                    COALESCE(office_data.office_details, JSON_ARRAY()) AS office_details,
                    COALESCE(contact_data.contact_details, JSON_ARRAY()) AS contact_details,
                    c.parent_company_name AS parent_company_name
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

                LEFT JOIN users AS u ON u.id = l.assignee
                LEFT JOIN companies AS c ON c.id = l.parent_company_id

                WHERE l.is_archived = FALSE 
                AND l.id = ?;

                `
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing fetchLeadDetailQuery:", error);
        throw error;
    }
}

export const fetchLeadListWithLastContactedQuery = (is_admin, user_id, parent_company_id = null) => {
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
                    c.parent_company_name AS parent_company_name,
                    DATE_FORMAT(logs.created_at, '%Y-%m-%d') AS latest_comment_date,
                    ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY logs.created_at DESC) AS rn
                FROM leads AS l
                LEFT JOIN lead_logs AS logs 
                    ON logs.lead_id = l.id
                LEFT JOIN companies AS c ON c.id = l.parent_company_id
                WHERE l.is_archived = FALSE
        `;

        if (!is_admin) {
            query += ` AND l.assignee = ?`;
            queryParams.push(user_id);
        }

        if (parent_company_id) {
            query += ` AND l.parent_company_id = ?`;
            queryParams.push(parent_company_id);
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
            SELECT 
            leads.id, 
            leads.company_name, 
            leads.product, 
            leads.industry_type, 
            leads.status, 
            CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
            DATE_FORMAT(leads.created_at, '%Y-%m-%d') AS created_date 
        FROM leads
        LEFT JOIN users AS u ON u.id = leads.assignee
        WHERE (
            LOWER(leads.company_name) LIKE LOWER(?) 
            OR LOWER(leads.industry_type) LIKE LOWER(?) 
            OR LOWER(leads.product) LIKE LOWER(?)
            OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(?)
        )
        AND leads.is_archived = FALSE;
    `;
    const value = `%${searchTerm.toLowerCase()}%`;
    const values = [value, value, value, value, value, value]; 
    return pool.query(query, values);
  } catch (error) {
    console.error("Error executing searchTermQuery:", error);
    throw error;
  }
};

export const searchTermWithUserIdQuery = (searchTerm, userId) => {
  try {
    const user_id= userId
    const query = `
            SELECT 
            leads.id, 
            leads.company_name, 
            leads.product, 
            leads.industry_type, 
            leads.status, 
            CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
            DATE_FORMAT(leads.created_at, '%Y-%m-%d') AS created_date 
        FROM leads 
        LEFT JOIN users AS u ON u.id = leads.assignee
        WHERE (
            LOWER(company_name) LIKE LOWER(?) 
            OR LOWER(industry_type) LIKE LOWER(?) 
            OR LOWER(product) LIKE LOWER(?)
            OR LOWER(u.first_name) LIKE LOWER(?)    
            OR LOWER(u.last_name) LIKE LOWER(?)
        )
        AND is_archived = FALSE;
    `;
    const value = `%${searchTerm.toLowerCase()}%`;
    const values = [user_id, value, value, value, value, value]; 
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
                LEFT JOIN lead_logs AS logs 
                    ON logs.lead_id = l.id
                WHERE (
                    LOWER(company_name) LIKE LOWER(?) 
                    OR LOWER(industry_type) LIKE LOWER(?) 
                    OR LOWER(product) LIKE LOWER(?)
                ) AND l.is_archived = FALSE
        `;

        const value = `%${searchTerm.toLowerCase()}%`;
        queryParams.push(value)
        queryParams.push(value)
        queryParams.push(value)
        if (!is_admin) {
            query += ` AND l.assignee = ?`;
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
      item.product,
      item.industry_type,
      item.suitable_product,
      created_by,
      item.status
    ]);

    const insertQuery = `
      INSERT INTO leads (id, company_name, product, industry_type, suitable_product, created_by, status)
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
            address,
            city,
            state,
            country
        ) VALUES ?`

        const values = filteredData.map(item => [
            uuidv4(),                  
            item.lead_id,
            item.address,              
            item.city,              
            item.state,              
            item.country,              
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
            item.email && item.email.trim() !== "" ? item.email.trim() : "",
            created_by               
        ]);
        return pool.query(query, [values]);
    } catch (error) {
        console.error("Error executing insertOfficeDataFromExcelQuery:", error);
        throw error;
    }
}

export const fetchCompanyIdQuery = (array) => {
  try {
    const query = ` SELECT id FROM leads WHERE company_name = ?`;
    return pool.query(query, array);
  } catch (error) {
    console.error("Error executing fetchCompanyIdQuery:", error);
    throw error;
  }
};

export const fetchCompanyNameDuplicatesQuery = (array) => {
  try {
    const query = `
     SELECT id, company_name FROM leads WHERE LOWER(company_name) LIKE CONCAT('%', LOWER(?), '%')
    `;
    return pool.query(query, array);
  } catch (error) {
    console.error("Error executing fetchCompanyNameDuplicatesQuery:", error);
    throw error;
  }
};

export const fetchInactiveLeadsQuery = (is_admin, user_id) => {
    try{
        const weeks = process.env.LEAD_INACTIVE_DURATION || 2;
        let query = '';
        let params = [];
        if (is_admin) {
            query = `
               SELECT 
                l.id, 
                l.company_name, 
                l.product, 
                l.industry_type, 
                l.status, 
                DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
                MAX(logs.created_at) AS last_log_date
            FROM leads l 
            LEFT JOIN users u 
                ON u.id = l.assignee
            JOIN lead_logs logs ON logs.lead_id = l.id
            WHERE l.is_archived = FALSE AND
                l.created_at < DATE_SUB(NOW(), INTERVAL 2 WEEK)
            GROUP BY l.id, l.company_name, l.product, l.industry_type, l.status, l.created_at, u.first_name, u.last_name
            HAVING (
                last_log_date IS NULL OR
                last_log_date < DATE_SUB(NOW(), INTERVAL ? WEEK)
            )
            ORDER BY l.created_at DESC;`;
            params = [weeks];
        }else{
            query = `
               SELECT 
                l.id, 
                l.company_name, 
                l.product, 
                l.industry_type, 
                l.status, 
                DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
                MAX(logs.created_at) AS last_log_date
            FROM leads l 
            LEFT JOIN users u 
                ON u.id = l.assignee
            JOIN lead_logs logs ON logs.lead_id = l.id
            WHERE l.is_archived = FALSE AND l.assignee = ? AND
                l.created_at < DATE_SUB(NOW(), INTERVAL 2 WEEK)
            GROUP BY l.id, l.company_name, l.product, l.industry_type, l.status, l.created_at, u.first_name, u.last_name
            HAVING (
                last_log_date IS NULL OR
                last_log_date < DATE_SUB(NOW(), INTERVAL ? WEEK)
            )
            ORDER BY l.created_at DESC;`;
            params = [user_id, weeks];
        }

        return pool.query(query, params);
    } catch (error) {
        console.error("Error executing fetchInactiveLeadsQuery:", error);
        throw error;
    }
}

export const fetchPossibleInactiveLeadsQuery = (is_admin, user_id) => {
    try {
        const weeks = process.env.LEAD_INACTIVE_DURATION || 2;
        const days = (weeks * 7) - 3;
        let query = '';
        let params = [];

        if (is_admin) {
            query = `
                SELECT 
                    l.id, 
                    l.company_name, 
                    l.product, 
                    l.industry_type, 
                    l.status, 
                    DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                    CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
                    MAX(logs.created_at) AS last_log_date
                FROM leads l 
                LEFT JOIN users u ON u.id = l.assignee
                LEFT JOIN lead_logs logs ON logs.lead_id = l.id
                WHERE l.is_archived = FALSE AND
                l.created_at < DATE_SUB(NOW(), INTERVAL 2 WEEK)
                GROUP BY l.id, l.company_name, l.product, l.industry_type, l.status, l.created_at, u.first_name, u.last_name
                HAVING (
                    last_log_date IS NULL OR
                    last_log_date < DATE_SUB(NOW(), INTERVAL ? DAY)
                )
                ORDER BY l.created_at DESC;
            `;
            params = [days];
        } else {
            query = `
                SELECT 
                    l.id, 
                    l.company_name, 
                    l.product, 
                    l.industry_type, 
                    l.status, 
                    DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                    CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
                    MAX(logs.created_at) AS last_log_date
                FROM leads l 
                LEFT JOIN users u ON u.id = l.assignee
                LEFT JOIN lead_logs logs ON logs.lead_id = l.id
                WHERE l.is_archived = FALSE AND l.assignee = ? AND
                l.created_at < DATE_SUB(NOW(), INTERVAL 2 WEEK)
                GROUP BY l.id, l.company_name, l.product, l.industry_type, l.status, l.created_at, u.first_name, u.last_name
                HAVING (
                    last_log_date IS NULL OR
                    last_log_date < DATE_SUB(NOW(), INTERVAL ? DAY)
                )
                ORDER BY l.created_at DESC;
            `;
            params = [user_id, days];
        }

        return pool.query(query, params);
    } catch (error) {
        console.error("Error executing fetchPossibleInactiveLeadsQuery:", error);
        throw error;
    }
};

export const fetchAssignedLeadsQuery = (action) => {
  try {
    let query ='';
    if(action == 'assigned'){
        query = `
           SELECT 
                l.id, 
                l.company_name, 
                l.product, 
                l.industry_type, 
                l.status, 
                DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                CONCAT(u.first_name, ' ', u.last_name) AS assigned_person
            FROM 
                leads l
            LEFT JOIN 
                users u ON u.id = l.assignee
            WHERE 
                l.assignee IS NOT NULL;`
    }else if(action = 'unassigned'){
        query = `
           SELECT 
                l.id, 
                l.company_name, 
                l.product, 
                l.industry_type, 
                l.status, 
                DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                CONCAT(u.first_name, ' ', u.last_name) AS assigned_person
            FROM 
                leads l
            LEFT JOIN 
                users u ON u.id = l.assignee
            WHERE 
                l.assignee IS NULL;`
    }
   
    return pool.query(query);
  } catch (error) {
    console.error("Error executing fetchAssignedLeadsQuery:", error);
    throw error;
  }
};

export const fetchDifferentLeadsCountQuery = (userId, isAdmin) => {
  try {
    const weeks = process.env.LEAD_INACTIVE_DURATION || 2;
    const inactiveDays = weeks * 7;            
    const possibleInactiveDays = inactiveDays - 3;
    let queryParams = [inactiveDays, possibleInactiveDays];
    let whereClause = '';

    if (!isAdmin) {
      whereClause = 'WHERE l.assignee = ?';
      queryParams.push(userId);
    }

    const query = `
        SELECT
            COUNT(*) AS total_leads,
            COUNT(CASE WHEN assignee IS NOT NULL THEN 1 END) AS assigned_leads,
            COUNT(CASE WHEN assignee IS NULL THEN 1 END) AS unassigned_leads,

            COUNT(CASE 
            WHEN last_log_date IS NOT NULL 
                AND last_log_date < DATE_SUB(CURDATE(), INTERVAL ? DAY)
            THEN 1
            END) AS inactive_leads,

            COUNT(CASE 
            WHEN last_log_date IS NULL 
                AND created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)
            THEN 1
            END) AS possible_inactive_leads,

            COUNT(CASE 
            WHEN has_today_followup = 1
            THEN 1
            END) AS today_followups

        FROM (
            SELECT
            l.id,
            l.assignee,
            l.created_at,
            MAX(logs.created_at) AS last_log_date,
            MAX(CASE WHEN DATE(logs.action_date) = CURDATE() THEN 1 ELSE 0 END) AS has_today_followup
            FROM leads l
            LEFT JOIN lead_logs logs ON logs.lead_id = l.id
            ${whereClause}
            GROUP BY l.id
        ) AS lead_summary;
`;


    return pool.query(query, queryParams);
  } catch (error) {
    console.error("Error executing fetchAssignedLeadsQuery:", error);
    throw error;
  }
};

export const fetchTodaysFollowupLeadsQuery = () => {
  try {
    let query =`
           SELECT 
                l.id, 
                l.company_name, 
                l.product, 
                l.industry_type, 
                l.status, 
                DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
                CONCAT(u.first_name, ' ', u.last_name) AS assigned_person
            FROM 
                leads l
            LEFT JOIN 
                users u ON u.id = l.assignee
            LEFT JOIN lead_logs logs ON logs.lead_id = l.id
            WHERE 
                DATE(logs.action_date) = CURDATE()
                GROUP BY 
            l.id;`
   
    return pool.query(query);
  } catch (error) {
    console.error("Error executing fetchAssignedLeadsQuery:", error);
    throw error;
  }
};

export const checkBrandCompanyIdQuery = (array) => {
  try {
    const query = `
     SELECT id, parent_company_name FROM companies WHERE id = ?
    `;
    return pool.query(query, array);
  } catch (error) {
    console.error("Error executing checkBrandCompanyIdQuery:", error);
    throw error;
  }
};

export const fetchManagingBrandsQuery = () => {
  try {
    const query = `SELECT id, parent_company_name FROM companies`;
    return pool.query(query);
  } catch (error) {
    console.error("Error executing fetchManagingBrandsQuery:", error);
    throw error;
  }
};

export const isCompanyBrandExistQuery = (array) => {
  try {
    const query = `
     SELECT id, parent_company_name FROM companies WHERE parent_company_name = ?
    `;
    return pool.query(query, array);
  } catch (error) {
    console.error("Error executing isCompanyBrandExistQuery:", error);
    throw error;
  }
};

export const createManagingBrandQuery = async (array)=> {
    try {
        let query = `INSERT INTO companies (
            id,
            parent_company_name
        ) VALUES (?,?)`

        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing createManagingBrandQuery:", error);
        throw error;
    }
}