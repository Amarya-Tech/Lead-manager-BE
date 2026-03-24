import leadLogsTable from "../v1/leadCommunications/model/leadCommunicationLogsModel.js";
import leadCommunicationTable from "../v1/leadCommunications/model/leadCommunicationModel.js";
import brandTable from "../v1/leads/model/companyModel.js";
import leadContactTable from "../v1/leads/model/leadContactModel.js";
import leadIndustryTypeTable from "../v1/leads/model/leadIndustryTypesModel.js";
import leadTable from "../v1/leads/model/leadModel.js";
import leadOfficeTable from "../v1/leads/model/leadOfficesModel.js";
import tenantTable from "../v1/tenant/model/tenantModel.js";
import userTable from "../v1/users/model/userModel.js";

export default [tenantTable, brandTable, userTable,   
    leadTable, leadOfficeTable, leadContactTable, leadCommunicationTable, leadLogsTable, leadIndustryTypeTable];