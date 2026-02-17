import pool from "../../../config/db.js"
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv"

export const fetchLeadByIdQuery = async (lead) => {
  try{
    const query = `
      SELECt * from leads where id = ?
    `
    return await pool.query(query , lead);
  }catch(error){
    console.error("Error in executing the fetchLeadByIdQuery" , error);
    throw error;
  }
}

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

export const fetchLeadTableListQuery = (parentCompanyId = null , parent_company_name) => {
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
        if(parent_company_name && parent_company_name.toString().toLowerCase() != "All Brands".toLowerCase()){
          query += ` AND parent_company_name = ?`;
          params.push(parent_company_name);
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
					COALESCE(communication_data.comment_details, JSON_ARRAY()) AS comment_details,
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
                
                LEFT JOIN (
                    SELECT 
                        lead_id,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                 'created_at', created_at,
                                'comment', comment,
                                'action' , action,
                                'action_date' , action_date
                            )
                        ) AS comment_details
                    FROM lead_logs
                    GROUP BY lead_id
                ) AS communication_data ON communication_data.lead_id = l.id

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

export const advancedSearchQuery = (filters = {}) => {
  try {
    let query = `
      SELECT 
        leads.id, 
        leads.company_name, 
        leads.product, 
        leads.industry_type, 
        leads.status, 
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
        c.parent_company_name AS parent_company_name,
        DATE_FORMAT(leads.created_at, '%Y-%m-%d') AS created_date 
      FROM leads
      LEFT JOIN users AS u ON u.id = leads.assignee
      LEFT JOIN companies AS c ON c.id = leads.parent_company_id
      WHERE leads.is_archived = FALSE
    `;

    const values = [];

    // Brand filter
    if (filters.brandId && filters.brandId != "") {
      query += ` AND c.id = ? `;
      values.push(filters.brandId);
    }

    // Company name
    if (filters.companyName && filters.companyName != "") {
      query += ` AND LOWER(leads.company_name) LIKE LOWER(?) `;
      values.push(`%${filters.companyName.toLowerCase()}%`);
    }

     // status
    if(filters.status && filters.status != "") {
      query += ` AND LOWER(leads.status) = LOWER(?) `;
      values.push(`${filters.status.toLowerCase()}`);
    }

    // Industry type
    if (filters.industryType && filters.industryType != "") {
      query += ` AND LOWER(leads.industry_type) LIKE LOWER(?) `;
      values.push(`%${filters.industryType.toLowerCase()}%`);
    }

    // Product
    if (filters.product && filters.product != "") {
      query += ` AND LOWER(leads.product) LIKE LOWER(?) `;
      values.push(`%${filters.product.toLowerCase()}%`);
    }

    // Assigned person
    if (filters.assignedPerson && filters.assignedPerson != "") {
      query += ` AND LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(?) `;
      values.push(`%${filters.assignedPerson.toLowerCase()}%`);
    }

    // Generic searchTerm fallback (like Gmail "search all")
    if (filters.searchTerm && filters.searchTerm != "") {
      query += `
        AND (
          LOWER(leads.company_name) LIKE LOWER(?) 
          OR LOWER(leads.industry_type) LIKE LOWER(?) 
          OR LOWER(leads.product) LIKE LOWER(?) 
          OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(?)
        )
      `;
      const value = `%${filters.searchTerm.toLowerCase()}%`;
      values.push(value, value, value, value);
    }

    return pool.query(query, values);
  } catch (error) {
    console.error("Error executing advancedSearchQuery:", error);
    throw error;
  }
};

export const advanceSearchWithUserIdQuery = (filters = {}, userId) => {
  try {
    let query = `
      SELECT 
        leads.id, 
        leads.company_name, 
        leads.product, 
        leads.industry_type, 
        leads.status, 
        CONCAT(u.first_name, ' ', u.last_name) AS assigned_person,
        c.parent_company_name AS parent_company_name,
        DATE_FORMAT(leads.created_at, '%Y-%m-%d') AS created_date 
      FROM leads 
      LEFT JOIN users AS u ON u.id = leads.assignee
      LEFT JOIN companies AS c ON c.id = leads.parent_company_id
      WHERE leads.is_archived = FALSE
        AND leads.assignee = ?
    `;

    const values = [userId];

    // Brand filter
    if (filters.brandId && filters.brandId != "") {
      query += ` AND c.id = ? `;
      values.push(filters.brandId);
    }

    // Company name
    if (filters.companyName && filters.companyName != "") {
      query += ` AND LOWER(leads.company_name) LIKE LOWER(?) `;
      values.push(`%${filters.companyName.toLowerCase()}%`);
    }
    // status
    if(filters.status && filters.status != "") {
      query += ` AND LOWER(leads.status) = LOWER(?) `;
      values.push(`${filters.status.toLowerCase()}`);
    }

    // Industry type
    if (filters.industryType && filters.industryType != "") {
      query += ` AND LOWER(leads.industry_type) LIKE LOWER(?) `;
      values.push(`%${filters.industryType.toLowerCase()}%`);
    }

    // Product
    if (filters.product && filters.product != "") {
      query += ` AND LOWER(leads.product) LIKE LOWER(?) `;
      values.push(`%${filters.product.toLowerCase()}%`);
    }

    // Generic searchTerm fallback (like Gmail "search all")
    if (filters.searchTerm && filters.searchTerm != "") {
      query += `
        AND (
          LOWER(leads.company_name) LIKE LOWER(?) 
          OR LOWER(leads.industry_type) LIKE LOWER(?) 
          OR LOWER(leads.product) LIKE LOWER(?) 
          OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER(?)
        )
      `;
      const value = `%${filters.searchTerm.toLowerCase()}%`;
      values.push(value, value, value, value);
    }

    return pool.query(query, values);
  } catch (error) {
    console.error("Error executing searchTermWithUserIdQuery:", error);
    throw error;
  }
};

export const searchLeadForLeadsPageQuery = (filters = {}, is_admin, user_id) => {
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
              c.parent_company_name AS parent_company_name,
              ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY logs.created_at DESC) AS rn
          FROM leads AS l
          LEFT JOIN lead_logs AS logs ON logs.lead_id = l.id
          LEFT JOIN companies AS c ON c.id = l.parent_company_id
          WHERE l.is_archived = FALSE
    `;

     // Brand filter
    if (filters.brandId && filters.brandId != "") {
      query += ` AND c.id = ? `;
      queryParams.push(filters.brandId);
    }

    // Company name
    if (filters.companyName && filters.companyName != "") {
      query += ` AND LOWER(l.company_name) LIKE LOWER(?) `;
      queryParams.push(`%${filters.companyName.toLowerCase()}%`);
    }

    // Industry type
    if (filters.industryType && filters.industryType != "") {
      query += ` AND LOWER(l.industry_type) LIKE LOWER(?) `;
      queryParams.push(`%${filters.industryType.toLowerCase()}%`);
    }

    // Product
    if (filters.product && filters.product != "") {
      query += ` AND LOWER(l.product) LIKE LOWER(?) `;
      queryParams.push(`%${filters.product.toLowerCase()}%`);
    }

    // Generic searchTerm fallback (like Gmail "search all")
    if (filters.searchTerm && filters.searchTerm != "") {
      query += `
        AND (
          LOWER(l.company_name) LIKE LOWER(?) 
          OR LOWER(l.industry_type) LIKE LOWER(?) 
          OR LOWER(l.product) LIKE LOWER(?)
        )
      `;
      const value = `%${filters.searchTerm.toLowerCase()}%`;
      queryParams.push(value, value, value);
    }

    if (!is_admin) {
      query += ` AND l.assignee = ? `;
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
      item.parent_company_id,
      item.suitable_product,
      created_by,
      item.status
    ]);

    const insertQuery = `
      INSERT INTO leads (id, company_name, product, industry_type, parent_company_id, suitable_product, created_by, status)
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


export const updateCompanyDataQuery = async (companyUpdateData) => {
    try{
        const query = `
        UPDATE leads 
        SET 
          company_name = ? ,
          industry_type = ?,
          product = ?,
          parent_company_id = ?,
          suitable_product = ?,
          status = ?,
          updated_at = NOW()
        where id = ?
        `;
        const values = [
          companyUpdateData.company_name,
          companyUpdateData.industry_type,
          companyUpdateData.product,
          companyUpdateData.parent_company_id,
          companyUpdateData.suitable_product,
          companyUpdateData.status,
          companyUpdateData.id
        ];
        const [result] = await pool.query(query , values);
        // Fetch and return the updated record
        const fetchQuery = `
          SELECT * FROM leads WHERE id = ?
        `;

        const [rows] = await pool.query(fetchQuery, [companyUpdateData.id]);

        return rows;
    }catch(error){
        console.error("Error executing the updateCompanyDataQuery");
        throw error;
    }
}


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

export const fetchOfficeDetailsQuery = async (lead_id) => {
  try{
    if(!lead_id){
      return []
    }
    const query = `
      select * from lead_office where lead_id = ?
    `;

    return await pool.query(query , [lead_id]);
  }catch(error){
      console.error("Error executing fetchOfficeDetailsQuery:", error);
      throw error;
  }
}

export const updateOfficeDataQuery = async (officeUpdateData) => {
  try{
    const officeUpdateDataAddress = officeUpdateData.address && officeUpdateData.address.trim()
    if(officeUpdateDataAddress === ""){
       console.log("No valid office data to update.");
            return Promise.resolve([[], null]);
    }

    let query = `
      UPDATE lead_office
      SET
        address = ?,
        city = ?,
        state = ?,
        country = ?
      where
        lead_id = ?`
    const values = [
      officeUpdateData.address || null,
      officeUpdateData.city || null,
      officeUpdateData.state || null,
      officeUpdateData.country || null,
      officeUpdateData.lead_id
    ]

    return await pool.query(query , values);

  }catch(error){
    console.error("Error in executing the updateOfficeDataQuery:" , error);
    throw error;
  }
}

export const insertContactDataFromExcelQuery = (data, created_by)=> {
    try {
        const filteredData = data.filter(item => item.phone && item.phone.trim() !== "");
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

export const fetchLeadContactsById = async (lead_id) => {
  try{
    if(!lead_id){
      return [];
    }
    const query = `select * from lead_contact where lead_id = ?`;

    return pool.query(query , [lead_id])
  }catch(error){
    console.error("Error executing fetchLeadContactsById:", error);
    throw error;
  }
}

export const updateContactDataQuery = async (contactDetailsToAdd, user_id) => {
  try{
     const contactPersonInfo = contactDetailsToAdd.phone && contactDetailsToAdd.phone.trim();
     if(!contactPersonInfo){
          console.log("No valid contact data to update.");
          return Promise.resolve([[], null]);
     }
     let query = `UPDATE lead_contact 
        SET
            name = ?,
            designation = ?,
            phone = ?,
            email = ?
        Where
            lead_id = ?`

      const values = [
        contactDetailsToAdd.name,
        contactDetailsToAdd.designation,
        contactDetailsToAdd.phone,
        contactDetailsToAdd.email,
        contactDetailsToAdd.lead_id,
      ]

      return await pool.query(query , values);


  }catch(error){
    console.error("Error in executing the updateContactDataQuery" , error);
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

export const fetchCompanyNameDuplicatesForUpdateQuery = (array) => {
try {
    const query = `
     SELECT id, company_name FROM leads WHERE LOWER(company_name) = LOWER(?) AND id != ? 
    `;
    return pool.query(query, array);
  } catch (error) {
    console.error("Error executing fetchCompanyNameDuplicatesQuery:", error);
    throw error;
  }
}

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
            END) AS today_followups,

            /* ✅ NEW COLUMN */
            COUNT(CASE 
                WHEN has_followup_next_7_days = 1
                THEN 1
            END) AS leads_follow_up_next_7_days

        FROM (
            SELECT
                l.id,
                l.assignee,
                l.created_at,
                MAX(logs.created_at) AS last_log_date,

                MAX(
                    CASE 
                        WHEN DATE(logs.action_date) = CURDATE() 
                        THEN 1 
                        ELSE 0 
                    END
                ) AS has_today_followup,

                /* ✅ FLAG FOR NEXT 7 DAYS FOLLOW-UP */
                MAX(
                    CASE
                        WHEN DATE(logs.action_date) BETWEEN CURDATE()
                             AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                        THEN 1
                        ELSE 0
                    END
                ) AS has_followup_next_7_days

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
// for exporting the leads in csv form 
export const fetchLeadsForCsv = async (parentCompanyId = null , parent_company_name) => {
  try {
        let query = `
      SELECT 
        l.id, 
        l.company_name,  
        l.product,  
        l.industry_type,  
        l.status, 
        DATE_FORMAT(l.created_at, '%Y-%m-%d') AS created_date,
        u.email AS assigned_person,
        lo.address as address,
        lo.city as city,
        lo.country as country,
        lo.state as state,
        lc.phone as phone,
        l.suitable_product as suitable_product,
        c.parent_company_name AS parent_company_name,
        lc.email as email,
        lc.name as contact_person,  
        lc.designation as designation
      FROM leads l 
      LEFT JOIN users u ON u.id = l.assignee
      LEFT JOIN companies AS c ON c.id = l.parent_company_id
      LEFT JOIN lead_contact as lc on lc.lead_id = l.id
      LEFT JOIN lead_office as lo on lo.lead_id = l.id
      WHERE l.is_archived = FALSE
    `;

        const params = [];

        if (parentCompanyId) {
            query += ` AND l.parent_company_id = ?`;
            params.push(parentCompanyId);
        }
        if(parent_company_name && parent_company_name.toString().toLowerCase() != "All Brands".toLowerCase()){
          query += ` AND parent_company_name = ?`;
          params.push(parent_company_name);
        }

        query += ` ORDER BY l.created_at DESC;`;

        return pool.query(query, params);
    } catch (error) {
        console.error("Error executing fetchLeadTableListQuery:", error);
        throw error;
    }
}

// update lead only for the if the company exits
