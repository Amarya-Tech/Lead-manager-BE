import { validationResult } from "express-validator";
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, minorErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createDynamicUpdateQuery, toTitleCase } from "../../../utils/helper.js";
import { advancedSearchQuery, advanceSearchWithUserIdQuery, archiveLeadQuery, checkBrandCompanyIdQuery, createLeadContactQuery, createLeadOfficeQuery, createLeadQuery, 
    createManagingBrandQuery, fetchAssignedLeadsQuery, fetchCompanyIdQuery, fetchCompanyNameDuplicatesForUpdateQuery, fetchCompanyNameDuplicatesQuery, fetchDifferentLeadsCountQuery, 
    fetchInactiveLeadsQuery, fetchLeadByIdQuery, fetchLeadContactsById, fetchLeadDetailQuery, fetchLeadIndustryQuery, fetchLeadListWithLastContactedQuery, fetchLeadsForCsv, fetchLeadTableListQuery, 
    fetchLeadTableListUserQuery, fetchManagingBrandsQuery, fetchOfficeDetailsQuery, fetchPossibleInactiveLeadsQuery, fetchTodaysFollowupLeadsQuery, 
    insertAndFetchCompanyDataFromExcelQuery, insertContactDataFromExcelQuery, insertLeadIndustries, insertOfficeDataFromExcelQuery, 
    isCompanyBrandExistQuery, searchLeadForLeadsPageQuery, updateCompanyDataQuery, updateContactDataQuery, updateLeadQuery, 
    updateOfficeDataQuery} from "../model/leadQuery.js";
import { checkUserExistsBasedOnEmailQuery, checkUserIdQuery } from "../../users/model/userQuery.js";
import { importExcel, importCommentExcel } from "../../../utils/importExcel.js";
import { addAssigneeToLeadQuery, addCommentToLeadQuery, addCommentToLeadUsingExcelQuery, insertAssigneeActionFromExcelQuery, insertAssigneeDataFromExcelQuery, isAssigneeExistQuery, isLeadCommunicationIdExistQuery, updateAssigneeDataQuery } from "../../leadCommunications/model/leadCommunicationQuery.js";
import { format } from "@fast-csv/format";

dotenv.config();

export const createLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        let log_id = uuidv4();
        let { company_name, product, industry_type, export_value, insured_amount, parent_company_id } = req.body;
        let user_id = req.params.id;
        company_name = toTitleCase(company_name);
        product = product ? toTitleCase(product) : product;
        const [isUserExist] = await checkUserIdQuery([user_id]);

        const [company_data] = await checkBrandCompanyIdQuery([parent_company_id])

        if(company_data.length == 0){
            return notFoundResponse(res, [], 'Managing Brand does not exist');
        }

        const [lead_data] = await createLeadQuery([
            id,
            company_name,
            parent_company_id,
            product,
            industry_type,
            export_value,
            insured_amount,
            user_id
        ]);

        const addAssigneeData = {
            id: log_id,
            lead_id: lead_data.id,
            created_by: user_id,
            comment: `${lead_data.company_name} created!`,
            action: 'CREATE_LEAD'
        }

       const [data] = await addCommentToLeadQuery([addAssigneeData.id, addAssigneeData.lead_id, addAssigneeData.created_by, addAssigneeData.comment, addAssigneeData.action])
        return successResponse(res, { "lead_id": id }, 'Lead Created Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const updateLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        let table = 'leads';

        const condition = {
            id: id,
        };
        const req_data = req.body;

        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateLeadQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'Lead data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const addLeadOffices = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();

        let { lead_id, address, city, state, country, postal_code } = req.body;
        address = toTitleCase(address);
        city = toTitleCase(city);
        state = toTitleCase(state);
        country = toTitleCase(country);

        const [office_data] = await createLeadOfficeQuery([
            id,
            lead_id,
            address,
            city,
            state,
            country,
            postal_code
        ]);

        return successResponse(res, office_data, 'Lead office added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const updateLeadOffices = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        const office_id = req.params.office_id;
        let table = 'lead_office';

        const condition = {
            id: office_id,
            lead_id: id,
        };
        const req_data = req.body;

        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateLeadQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'Lead data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const addLeadContact = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();

        let { lead_id, name, designation, phone, alt_phone, email } = req.body;
        name = toTitleCase(name);
        let user_id = req.params.id;

        const [contact_data] = await createLeadContactQuery([
            id,
            lead_id,
            name,
            designation,
            phone,
            alt_phone ?? null,
            email || '',
            user_id
        ]);

        return successResponse(res, contact_data, 'Lead contact added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const updateLeadContact = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        const contact_id = req.params.contact_id;
        let table = 'lead_contact';

        const condition = {
            id: contact_id,
            lead_id: id,
        };
        const req_data = req.body;

        let query_values = await createDynamicUpdateQuery(table, condition, req_data)
        await updateLeadQuery(query_values.updateQuery, query_values.updateValues);
        return successResponse(res, 'Lead data updated successfully.');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
}

export const archiveLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let lead_id = req.params.lead_id;

        const [data] = await archiveLeadQuery([lead_id]);

        return successResponse(res, data, 'Lead archived Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchLeadTableDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let data;
        const user_id = req.params.id
        let company_id = req.query.company_id;
        if (!company_id || company_id === 'null' || company_id === 'undefined') {
            company_id = null;
        }
        const [isUserExist] = await checkUserIdQuery([user_id]);
        if(isUserExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        if (company_id) {
            const [company_data] = await checkBrandCompanyIdQuery([company_id]);
            if (company_data.length === 0) {
                return notFoundResponse(res, [], 'Managing Brand does not exist');
            }
        }

        if (isUserExist[0].role === 'admin' || isUserExist[0].role === 'super_admin') {
            [data] = await fetchLeadTableListQuery(company_id);
        } else {
            [data] = await fetchLeadTableListUserQuery(user_id, company_id);
        }

        return successResponse(res, data, 'Lead table data fetched Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchLeadDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        const id = req.params.lead_id;
        const [data] = await fetchLeadDetailQuery([id]);

        return successResponse(res, data, 'Lead data fetched Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchLeadLogDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let data;
        let is_admin = false;
        const user_id = req.params.id
        let company_id = req.query.company_id;
        if (!company_id || company_id === 'null' || company_id === 'undefined') {
            company_id = null;
        }
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role == "admin" || isUserExist[0].role == "super_admin") {
            is_admin = true
        }

        if (company_id) {
            const [company_data] = await checkBrandCompanyIdQuery([company_id]);
            if (company_data.length === 0) {
                return notFoundResponse(res, [], 'Managing Brand does not exist');
            }
        }

        [data] = await fetchLeadListWithLastContactedQuery(is_admin, user_id, company_id);

        return successResponse(res, data, 'Lead table data fetched Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error); 
    }
};

// export const addIndustryTypeDetails = async (req, res, next) => {
//     try {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return errorResponse(res, errors.array(), "")
//         }
//         const data =  req.body.data
//         console.log(data)

//        let  [data1] = await insertLeadIndustries(data);

//         return successResponse(res, data1, 'Industry inserted successfully');
//     } catch (error) {
//         return internalServerErrorResponse(res, error);
//     }
// };

export const fetchIndustryType = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let [data1] = await fetchLeadIndustryQuery();

        return successResponse(res, data1, 'Industry fetched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const searchTermInLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let data;
        const filters = req.body
        const user_id = req.params.id
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role === 'admin' || isUserExist[0].role === 'super_admin') {
            [data] = await advancedSearchQuery(filters);
        } else {
            [data] = await advanceSearchWithUserIdQuery(filters, user_id);
        }
        return successResponse(res, data, 'Leads searched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const searchTermInLeadsPage = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        const filters = req.body
        let is_admin = false;
        const user_id = req.params.id
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role == "admin" || isUserExist[0].role == "super_admin") {
            is_admin = true
        }

        let [data1] = await searchLeadForLeadsPageQuery(filters, is_admin, user_id);

        return successResponse(res, data1, 'Leads searched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const insertLeadsDataFromExcel = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        
        const fileBuffer = req.file.buffer;
        const user_id = req.params.id;
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist.length == 0) {
            return notFoundResponse(res, [], "User not found")
        }

        let excelData = importExcel(fileBuffer);
        
        // Arrays to separate ADD and UPDATE operations
        const leadsToAdd = [];
        const leadsToUpdate = [];
        
        let isAssignee;
        let parent_company_data;
        
        // First pass: Validate and separate ADD/UPDATE leads
        for (let i = 0; i < excelData.length; i++) {
            const row = excelData[i];
            
            // Initialize validation errors array
            if (!Array.isArray(row.validation_error)) {
                if (typeof row.validation_error === 'string' && row.validation_error.trim() !== '') {
                    row.validation_error = row.validation_error
                        .split(';')
                        .map(e => e.trim())
                        .filter(Boolean);
                } else {
                    row.validation_error = [];
                }
            }
            
            // Check for ID to determine ADD or UPDATE flow
            if (row.id && row.id !== '') {
                // UPDATE flow - check if lead exists
                const [existingLead] = await fetchLeadByIdQuery([row.id]);
                if (existingLead.length === 0) {
                    row.validation_error.push("Lead with this ID does not exist");
                } else {
                    leadsToUpdate.push(row);
                }
            } else {
                // ADD flow
                leadsToAdd.push(row);
            }
            
            // Common validations for both ADD and UPDATE
            
            // Validate assignee if provided
            if (row.assignee && row.assignee != '') {
                [isAssignee] = await checkUserExistsBasedOnEmailQuery([row.assignee]);
                if (isAssignee.length == 0) {
                    row.validation_error.push("given assignee did not exist");
                }
            }
            
            // Validate managing brand
            [parent_company_data] = await isCompanyBrandExistQuery([row.managing_brand]);
            if (parent_company_data && parent_company_data.length == 0) {
                row.validation_error.push("managing brand does not exists");
            }
            
            // For ADD flow: Check for duplicate company name
            if (!row.id || row.id === '') {
                const [duplicates] = await fetchCompanyNameDuplicatesQuery([row.company_name]);
                if (duplicates && duplicates.length > 0) {
                    row.validation_error.push("Company name already exists. If you want to update, ensure that ID is present in column");
                }
            }
            
            // For UPDATE flow: Check if new company name conflicts with existing companies (excluding itself)
            if (row.id && row.id !== '') {
                const [duplicates] = await fetchCompanyNameDuplicatesForUpdateQuery([row.company_name, row.id]);
                if (duplicates && duplicates.length > 0) {
                    row.validation_error.push("Company name already exists for another lead");
                }
            }
            
            // Collect parent company data for later use
            if (parent_company_data && parent_company_data.length > 0) {
                row.parent_company_data = parent_company_data[0];
            }
            
        }
        for (let i = 0; i < excelData.length; i++) {
            const row = excelData[i];
            if (row.validation_error.length > 0) {
                return minorErrorResponse(res, excelData, "Error in file, please update and then try again.");
            }
        }
        // Process ADD operations
        const addedLeads = [];
        if (leadsToAdd.length > 0) {
            // Prepare company details for ADD
            const companyDetailsToAdd = leadsToAdd.map(obj => {
                let newObj = {};
                newObj['company_name'] = obj['company_name'];
                newObj['industry_type'] = obj['industry_type'];
                newObj['product'] = obj['product'];
                newObj['parent_company_id'] = obj.parent_company_data ? obj.parent_company_data.id : null;
                newObj['suitable_product'] = obj['suitable_product'];
                newObj['status'] = obj['status'] || 'lead';
                return newObj;
            });
            
            // Insert new companies
            let addedCompanies = await insertAndFetchCompanyDataFromExcelQuery(companyDetailsToAdd, user_id);
            
            // Process office details for added leads
            const officeDetailsToAdd = leadsToAdd.map(obj => {
                let newObj = {};
                const matched = addedCompanies.find(item => item.company_name === obj.company_name);
                if (!matched) return null;
                
                newObj['lead_id'] = matched.id;
                newObj['address'] = obj['address'];
                newObj['city'] = obj['city'];
                newObj['state'] = obj['state'];
                newObj['country'] = obj['country'];
                return newObj;
            }).filter(item => item !== null);
            
            let addedOffices = await insertOfficeDataFromExcelQuery(officeDetailsToAdd);
            
            // Process contact details for added leads
            const contactDetailsToAdd = leadsToAdd.map(obj => {
                let newObj = {};
                const matched = addedCompanies.find(item => item.company_name === obj.company_name);
                if (!matched) return null;
                
                newObj['lead_id'] = matched.id;
                newObj['name'] = obj['contact_person'];
                newObj['designation'] = obj['designation'];
                newObj['phone'] = obj['phone_number'];
                newObj['email'] = obj['email'];
                return newObj;
            }).filter(item => item !== null);
            
            let addedContacts = await insertContactDataFromExcelQuery(contactDetailsToAdd, user_id);
            
            // Process assignee data for added leads
            const assigneeArrayToAdd = [];
            const createLeadArrayToAdd = [];
            
            for (const obj of leadsToAdd) {
                const matched = addedCompanies.find(item => item.company_name === obj.company_name);
                if (!matched) continue;
                
                let assigneeId = null;
                if (obj.assignee && obj.assignee != '') {
                    const [assigneePresent] = await checkUserExistsBasedOnEmailQuery([obj.assignee]);
                    assigneeId = assigneePresent?.[0]?.id || null;
                }
                
                assigneeArrayToAdd.push({
                    lead_id: matched.id,
                    assignee_id: assigneeId,
                });
                
                createLeadArrayToAdd.push({
                    lead_id: matched.id,
                    user_id,
                    comment: `${matched.company_name} Created!\n*Bulk Import*`,
                    action: 'CREATE_LEAD',
                });
            }
            
            let addedAssigneeData = await insertAssigneeDataFromExcelQuery(assigneeArrayToAdd);
            let addedAssigneeActions = await insertAssigneeActionFromExcelQuery(createLeadArrayToAdd);
            
            // Process status changes and assignments for added leads
            if (addedAssigneeData && addedAssigneeData.length > 0) {
                const commentActions = [];
                const assignedActions = [];
                
                for (const obj of leadsToAdd) {
                    const matched = addedCompanies.find(item => item.company_name === obj.company_name);
                    if (!matched) continue;
                    
                    const matchedCommunication = addedAssigneeData.find(item => item.lead_id === matched.id);
                    if (!matchedCommunication) continue;
                    
                    // Status update
                    const statusActionMap = {
                        'lead': 'COMMENT',
                        'prospect': 'TO_PROSPECT',
                        'active prospect': 'TO_ACTIVE_PROSPECT',
                        'customer': 'TO_CUSTOMER',
                        'expired lead': 'TO_EXPIRE'
                    };
                    
                    const action = statusActionMap[obj.status] || 'COMMENT';
                    
                    commentActions.push({
                        lead_id: matchedCommunication.lead_id,
                        user_id: user_id,
                        comment: `Converted to ${obj.status}\n*Bulk Import*`,
                        action: action
                    });
                    
                    // Assignment if assignee exists
                    if (obj.assignee && obj.assignee != '') {
                        const [isAssigneeExist] = await isAssigneeExistQuery([obj.assignee]);
                        if (isAssigneeExist && isAssigneeExist[0]) {
                            assignedActions.push({
                                lead_id: matchedCommunication.lead_id,
                                user_id: isAssigneeExist[0].id,
                                comment: `${isAssigneeExist[0].id} | ${isAssigneeExist[0].first_name} ${isAssigneeExist[0].last_name}`,
                                action: 'ASSIGNED'
                            });
                        }
                    }
                }
                
                if (assignedActions.length > 0) {
                    await insertAssigneeActionFromExcelQuery(assignedActions);
                }
                
                if (commentActions.length > 0) {
                    await insertAssigneeActionFromExcelQuery(commentActions);
                }
            }
            
            addedLeads.push(...addedCompanies);
        }
        
        // Process UPDATE operations
        const updatedLeads = [];
        if (leadsToUpdate.length > 0) {
            for (const obj of leadsToUpdate) {
                // Update company details
                const companyUpdateData = {
                    id: obj.id,
                    company_name: obj.company_name,
                    industry_type: obj.industry_type,
                    product: obj.product,
                    parent_company_id: obj.parent_company_data && obj.parent_company_data.id,
                    suitable_product: obj.suitable_product,
                    status: obj.status || 'lead'
                };
                
                const updatedCompany = await updateCompanyDataQuery(companyUpdateData);
                
                // Update office details
                if (obj.address || obj.city || obj.state || obj.country) {
                    const officeUpdateData = {
                        lead_id: obj.id,
                        address: obj.address,
                        city: obj.city,
                        state: obj.state,
                        country: obj.country
                    };
                    const [officeDetails] = await fetchOfficeDetailsQuery(obj.id)
                    if(officeDetails && officeDetails.length > 0){
                        const updatedOffice  = await updateOfficeDataQuery(officeUpdateData);
                    }else{
                        let addedOffices = await insertOfficeDataFromExcelQuery([officeUpdateData]);
                    }
                }
                
                // Update contact details
                if (obj.contact_person || obj.designation || obj.phone_number || obj.email) {
                    const contactUpdateData = {
                        lead_id: obj.id,
                        name: obj.contact_person,
                        designation: obj.designation,
                        phone: obj.phone_number,
                        email: obj.email
                    };
                    const [contactDetails] = await fetchLeadContactsById(obj.id);
                    if(contactDetails && contactDetails.length > 0){
                        await updateContactDataQuery(contactUpdateData, user_id);
                    }else{
                        let addedContact = await insertContactDataFromExcelQuery([contactUpdateData] , user_id);
                    }
                    
                }
                
                // Update assignee if changed
                if (obj.assignee && obj.assignee != '') {
                    const [assigneePresent] = await checkUserExistsBasedOnEmailQuery([obj.assignee]);
                    if (assigneePresent && assigneePresent.length > 0) {
                        const assigneeUpdateData = {
                            lead_id: obj.id,
                            assignee_id: assigneePresent[0].id
                        };
                        await updateAssigneeDataQuery(assigneeUpdateData);
                        
                        // Add assignment action
                        await insertAssigneeActionFromExcelQuery([{
                            lead_id: obj.id,
                            user_id: assigneePresent[0].id,
                            comment: `${assigneePresent[0].id} | ${assigneePresent[0].first_name} ${assigneePresent[0].last_name}\n*Bulk Import Update*`,
                            action: 'ASSIGNED'
                        }]);
                    }
                }
                
                // Add status update action if status changed
                const [currentLead] = await fetchLeadByIdQuery([obj.id]);
                if (currentLead.length > 0 && currentLead[0].status !== obj.status) {
                    const statusActionMap = {
                        'lead': 'COMMENT',
                        'prospect': 'TO_PROSPECT',
                        'active prospect': 'TO_ACTIVE_PROSPECT',
                        'customer': 'TO_CUSTOMER',
                        'expired lead': 'TO_EXPIRE'
                    };
                    
                    const action = statusActionMap[obj.status] || 'COMMENT';
                    
                    await insertAssigneeActionFromExcelQuery([{
                        lead_id: obj.id,
                        user_id: user_id,
                        comment: `Status updated to ${obj.status}\n*Bulk Import Update*`,
                        action: action
                    }]);
                }
                
                // Add update action
                await insertAssigneeActionFromExcelQuery([{
                    lead_id: obj.id,
                    user_id: user_id,
                    comment: `${obj.company_name} updated via bulk import`,
                    action: 'COMMENT'
                }]);
                
                updatedLeads.push(updatedCompany[0]);
            }
        }
        
        // Prepare response
        const result = {
            added: addedLeads,
            updated: updatedLeads,
            summary: {
                total: excelData.length,
                added: leadsToAdd.length,
                updated: leadsToUpdate.length
            }
        };
        
        return successResponse(res, result, 'Leads processed successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const insertLeadsCommentDataFromExcel = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let assignee_type;
        const fileBuffer = req.file.buffer;
        const user_id = req.params.id;
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist.length == 0) {
            return notFoundResponse(res, [], "User not found")
        }

        let excelData = importCommentExcel(fileBuffer)

        for (let i = 0; i < excelData.length; i++) {
            if (excelData[i].validation_error == null) {
                excelData[i].validation_error = [];
            }       
            if(excelData[i].user != ''){
                const [isAssignee] = await checkUserExistsBasedOnEmailQuery([excelData[i].user]);
                if(isAssignee.length == 0 ){
                    excelData[i].validation_error.push("Given User did not exist")
                }
            }

            if (excelData[i].validation_error.length > 0 ) {
                return minorErrorResponse(res, excelData, "Error in file, please update and then try again.")
            }
        }

        const companyDetails = await Promise.all(
            excelData.map(async (obj) => {
                let [id] = await fetchCompanyIdQuery(obj['company_name'])
                const lead_id = id[0].id
                let lead_communication_id;

                const [isAssignee] = await checkUserExistsBasedOnEmailQuery([obj['user']]);

                const [isLeadCommunicationIdExist] = await isLeadCommunicationIdExistQuery([lead_id, isAssignee[0].id])

                if (isLeadCommunicationIdExist.length == 0) {
                    await addAssigneeToLeadQuery([
                        uuidv4(),
                        lead_id,
                        isAssignee[0].id,
                        assignee_type = isAssignee[0].role,
                        ""
                    ]);

                    const [data] = await isLeadCommunicationIdExistQuery([lead_id,  isAssignee[0].id])

                    lead_communication_id = data[0].id
                } else {
                    lead_communication_id = isLeadCommunicationIdExist[0].id
                }

                const [lead_data] = await addCommentToLeadUsingExcelQuery([
                    uuidv4(),
                    lead_communication_id,
                    isAssignee[0].id,
                    obj['comments'],
                    'COMMENT',
                    obj['date']
                ]);
                return lead_data;
            })
        );

        return successResponse(res, companyDetails, 'Comments added successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchMatchingLeadsRecords = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let company_names= []
        const term = req.query.company
        let [data1] = await fetchCompanyNameDuplicatesQuery(term);

        if(data1.length < 4){
            for (let i=0; i<data1.length; i++){
                company_names.push(data1[i].company_name)
            }
        }
        return successResponse(res, {companies_matched_count : data1.length, company_names}, 'Matching companies fetched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchInactiveLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let user_id = req.params.id;
        let action = req.body.action;
        let inactiveLeads;
        let is_admin = false;

        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role == "admin" || isUserExist[0].role == "super_admin") {
            is_admin = true
        }

        if(action == 'possible_inactive'){
            [inactiveLeads] = await fetchPossibleInactiveLeadsQuery(is_admin, user_id)
        }else{
            [inactiveLeads] = await fetchInactiveLeadsQuery(is_admin, user_id)
        }
       
        return successResponse(res, inactiveLeads, 'Leads fetched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchAssignedUnassignedLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let user_id = req.params.id;
        let action = req.body.action; 

       const [leads] = await fetchAssignedLeadsQuery(action)
       
        return successResponse(res, leads, 'Leads fetched successfully');
    } catch (error) {  
        return internalServerErrorResponse(res, error);
    }
};

export const fetchTodaysFollowupLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let user_id = req.params.id;

       const [leads] = await fetchTodaysFollowupLeadsQuery()
       
        return successResponse(res, leads, 'Leads fetched successfully');
    } catch (error) {  
        return internalServerErrorResponse(res, error);
    }
};

export const fetchAllDifferentLeadTypesCount = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        
        let is_admin = false;
        let user_id = req.params.id;
        const [isUserExist] = await checkUserIdQuery([user_id]);
         if (isUserExist[0].role == "admin" || isUserExist[0].role == "super_admin") {
            is_admin = true
        }

       const [leads] = await fetchDifferentLeadsCountQuery(user_id, is_admin)
       
        return successResponse(res, leads, 'Leads fetched successfully');
    } catch (error) {  
        return internalServerErrorResponse(res, error);
    }
};

export const createManagingBrandAccount = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();
        let { company_name } = req.body;
        company_name = toTitleCase(company_name);

        const [isCompanyExist] = await isCompanyBrandExistQuery([company_name]);

        if (isCompanyExist.length > 0){
            return minorErrorResponse(res, '', "Managing Brand with same name exists")
        }

        const [company_data] = await createManagingBrandQuery([
            id,
            company_name
        ]);

        return successResponse(res, { "parent_company_id": id, "brand_name" : company_name }, 'Brand Added Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const fetchManagingBrandRecords = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }

        let [data1] = await fetchManagingBrandsQuery();

        if(data1.length == 0){
            return notFoundResponse(res, [], 'No Brands exist');
        }
        return successResponse(res, data1, 'Managing brands fetched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const getLeadByBrandname = async (req , res , next) => {
    try{
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let data;
        const user_id = req.params.id
        let company_id = req.query.company_id;
        let parent_company_name = req.query.parent_company_name;
        if (!company_id || company_id === 'null' || company_id === 'undefined') {
            company_id = null;
        }
        const [isUserExist] = await checkUserIdQuery([user_id]);
        if(isUserExist.length === 0){
            return notFoundResponse(res, [], 'User not found');
        }

        if (company_id) {
            const [company_data] = await checkBrandCompanyIdQuery([company_id]);
            if (company_data.length === 0) {
                return notFoundResponse(res, [], 'Managing Brand does not exist');
            }
        }

        if (isUserExist[0].role === 'admin' || isUserExist[0].role === 'super_admin') {
            [data] = await fetchLeadsForCsv(company_id , parent_company_name);
        } else {
            [data] = await fetchLeadTableListUserQuery(user_id, company_id);
        }
        // Set headers for CSV Download
        const fileName = company_id 
        ? `leads_${company_id}.csv` 
        : `all_leads.csv`;

        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        res.setHeader("Content-Type", "text/csv");

        const csvStream = format({ headers: true });

        // Pipe CSV to response
        csvStream.pipe(res);

        // Custom headings
        data.forEach(lead => {
        csvStream.write({
            "id" : lead.id,
            "Company Name": lead.company_name,
            "Product": lead.product ?? "",
            "Industry Type": lead.industry_type ?? "",
            "Managing Brand": lead.parent_company_name ?? "",
            "Address": lead.address ?? "",
            "City" : lead.city ?? "",
            "State/province" : lead.state ?? "",
            "Country" : lead.country ?? "",
            "Phone Number": lead.phone ?? "",
            "Contact Person" : lead.contact_person,
            "Designation": lead.designation ?? "",
            "email": lead.email ?? "",
            "Assignee": lead.assigned_person ?? "",
            "Lead status": lead.status ?? "",
            "Suitable Product" : lead.suitable_product ?? "", 
            
        });
        });

        csvStream.end();
    }catch(error){
        return internalServerErrorResponse(res,error)
    }
}