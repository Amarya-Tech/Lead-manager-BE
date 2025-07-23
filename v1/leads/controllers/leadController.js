import { validationResult } from "express-validator";
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, internalServerErrorResponse, minorErrorResponse, notFoundResponse, successResponse } from "../../../utils/response.js";
import { createDynamicUpdateQuery, toTitleCase } from "../../../utils/helper.js";
import { archiveLeadQuery, createLeadContactQuery, createLeadOfficeQuery, createLeadQuery, fetchCompanyIdQuery, fetchCompanyNameDuplicatesQuery, fetchLeadDetailQuery, fetchLeadIndustryQuery, fetchLeadListWithLastContactedQuery, fetchLeadTableListQuery, fetchLeadTableListUserQuery, insertAndFetchCompanyDataFromExcelQuery, insertContactDataFromExcelQuery, insertLeadIndustries, insertOfficeDataFromExcelQuery, searchLeadForLeadsPageQuery, searchTermQuery, searchTermWithUserIdQuery, updateLeadQuery } from "../model/leadQuery.js";
import { checkUserExistsBasedOnEmailQuery, checkUserIdQuery } from "../../users/model/userQuery.js";
import { importExcel, importCommentExcel } from "../../../utils/importExcel.js";
import { addAssigneeToLeadQuery, addCommentToLeadQuery, addCommentToLeadUsingExcelQuery, insertAssigneeActionFromExcelQuery, insertAssigneeDataFromExcelQuery, isLeadCommunicationIdExistQuery } from "../../leadCommunications/model/leadCommunicationQuery.js";

dotenv.config();

export const createLead = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array(), "")
        }
        let id = uuidv4();

        let { company_name, product, industry_type, export_value, insured_amount } = req.body;
        let user_id = req.params.id;
        company_name = toTitleCase(company_name);
        product = product ? toTitleCase(product) : product;

        const [lead_data] = await createLeadQuery([
            id,
            company_name,
            product,
            industry_type,
            export_value,
            insured_amount,
            user_id
        ]);

        return successResponse(res, { "lead_id": id }, 'Lead Created Successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

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
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role === 'admin' || isUserExist[0].role === 'super_admin') {
            [data] = await fetchLeadTableListQuery();
        } else {
            [data] = await fetchLeadTableListUserQuery([user_id, user_id]);
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
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role == "admin" || isUserExist[0].role == "super_admin") {
            is_admin = true
        }

        [data] = await fetchLeadListWithLastContactedQuery(is_admin, user_id);

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
        const term = req.query.term
        const user_id = req.params.id
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role === 'admin' || isUserExist[0].role === 'super_admin') {
            [data] = await searchTermQuery(term);
        } else {
            [data] = await searchTermWithUserIdQuery(term, user_id);
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

        const term = req.query.term
        let is_admin = false;
        const user_id = req.params.id
        const [isUserExist] = await checkUserIdQuery([user_id]);

        if (isUserExist[0].role == "admin" || isUserExist[0].role == "super_admin") {
            is_admin = true
        }

        let [data1] = await searchLeadForLeadsPageQuery(term, is_admin, user_id);

        return successResponse(res, data1, 'Leads searched successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const insertDataFromExcel = async (req, res, next) => {
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

        let excelData = importExcel(fileBuffer)

        let isAssignee;
        for (let i = 0; i < excelData.length; i++) {
            const [duplicates] = await fetchCompanyNameDuplicatesQuery([excelData[i].company_name]);
            if(excelData[i].assignee != ''){
                [isAssignee] = await checkUserExistsBasedOnEmailQuery([excelData[i].assignee]);
                if(isAssignee.length == 0 ){
                    excelData[i].validation_error.push("given assignee did not exist")
                }
            }

            if (!Array.isArray(excelData[i].validation_error)) {
                excelData[i].validation_error = [];
            }
            if(duplicates && duplicates.length >0 && excelData[i].company_name == duplicates[0].company_name){
                excelData[i].validation_error.push("company_name already exists")
            }
            if (excelData[i].validation_error.length > 0) {
                return minorErrorResponse(res, excelData, "Error in file, please update and then try again.")
            }
        }

        const companyDetails = excelData.map(obj => {
            let newObj = {}
            newObj['company_name'] = obj['company_name']
            newObj['industry_type'] = obj['industry_type']
            newObj['product'] = obj['product']
            newObj['suitable_product'] = obj['suitable_product']
            newObj['status'] = obj['status'] || 'lead'
            return newObj
        })

        let data1 = await insertAndFetchCompanyDataFromExcelQuery(companyDetails, user_id)

        const officeDetails = excelData.map(obj => {
            let newObj = {};
            const matched = data1.find(item => item.company_name === obj.company_name);

            newObj['lead_id'] = matched.id
            newObj['address'] = obj['address']
            newObj['city'] = obj['city']
            newObj['state'] = obj['state']
            newObj['country'] = obj['country']
            return newObj
        })

        let data2 = await insertOfficeDataFromExcelQuery(officeDetails)

        const contactDetails = excelData.map(obj => {
            let newObj = {};
            const matched = data1.find(item => item.company_name === obj.company_name);

            newObj['lead_id'] = matched.id
            newObj['name'] = obj['contact_person']
            newObj['designation'] = obj['designation']
            newObj['phone'] = obj['phone_number']
            newObj['email'] = obj['email']
            return newObj
        })

        let data3 = await insertContactDataFromExcelQuery(contactDetails, user_id)

       const assigneeDetails = await Promise.all(
            excelData.map(async (obj) => {
                let newObj = {};
                const matched = data1.find(item => item.company_name === obj.company_name);
                const [isAssignee] = await checkUserExistsBasedOnEmailQuery([obj.assignee]);

                newObj['lead_id'] = matched.id;
                newObj['assignee_id'] = isAssignee[0]?.id;
                newObj['assignee_type'] = isAssignee[0]?.role;
                return newObj;
            })
        );

        let data4 = await insertAssigneeDataFromExcelQuery(assigneeDetails)

        if(data4 && data4.length > 0){
            const commentActions = [];
            const assignedActions = [];

            excelData.forEach(obj => {
                const matched = data1.find(item => item.company_name === obj.company_name);
                if (!matched) return;

                const matchedCommunication = data4.find(item => item.lead_id === matched.id);
                if (!matchedCommunication) return;

                const statusActionMap = {
                    'lead': 'COMMENT',
                    'prospect': 'TO_PROSPECT',
                    'active prospect': 'TO_ACTIVE_PROSPECT',
                    'customer': 'TO_CUSTOMER',
                    'expired lead': 'TO_EXPIRE'
                };

                const action = statusActionMap[obj.status] || null;

                const newObj = {
                    lead_communication_id: matchedCommunication.id,
                    user_id: matchedCommunication.assignee_id,
                    comment: `Converted to ${obj.status} \nBulk Import`,
                    action: action
                };

                const newObj2 = {
                    lead_communication_id: matchedCommunication.id,
                    user_id: matchedCommunication.assignee_id,
                    comment: matchedCommunication.description,
                    action: 'ASSIGNED'
                };

                commentActions.push(newObj);
                assignedActions.push(newObj2);
            });

            const data5 = await insertAssigneeActionFromExcelQuery(commentActions)
            const data6 = await insertAssigneeActionFromExcelQuery(assignedActions)
        }

        return successResponse(res, data1, 'Industry added successfully');
    } catch (error) {
        return internalServerErrorResponse(res, error);
    }
};

export const insertCompanyCommentDataFromExcel = async (req, res, next) => {
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

export const fetchMatchingCompanyRecords = async (req, res, next) => {
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