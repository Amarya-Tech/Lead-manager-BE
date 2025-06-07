import leadCommunicationLogsTable from "../v1/leadCommunications/model/leadCommunicationLogsModel.js";
import leadCommunicationTable from "../v1/leadCommunications/model/leadCommunicationModel.js";
import leadContactTable from "../v1/leads/model/leadContactModel.js";
import leadTable from "../v1/leads/model/leadModel.js";
import leadOfficeTable from "../v1/leads/model/leadOfficesModel.js";
import userTable  from "../v1/users/model/userModel.js";

export default [userTable, leadTable, leadOfficeTable, leadContactTable, leadCommunicationTable, leadCommunicationLogsTable];