import express, { Router } from 'express';
import multer from 'multer';
import { addLeadContactVal, addLeadOfcVal, createLeadVal, logOutVal, updateLeadContactVal, updateLeadOfcVal, updateLeadVal } from '../../../utils/validation.js';
import { addLeadContact, addLeadOffices, archiveLead, createLead, fetchIndustryType, fetchLeadDetails, fetchLeadLogDetails, fetchLeadTableDetails, searchTermInLead, 
    searchTermInLeadsPage, insertLeadsDataFromExcel, updateLead, updateLeadContact, updateLeadOffices, insertLeadsCommentDataFromExcel, 
    fetchMatchingLeadsRecords,
    fetchInactiveLead,
    fetchAssignedUnassignedLead,
    fetchAllDifferentLeadTypesCount,
    fetchTodaysFollowupLead,
    createManagingBrandAccount,
    fetchManagingBrandRecords} from '../controllers/leadController.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSuperAdminSession } from '../../../middlewares/allThreeRoleAuth.js';
import { authenticateAdminSuperAdminSession } from '../../../middlewares/admiin&SuperAdminAuth.js';
import { authenticateSuperAdminSession } from '../../../middlewares/superAdminAuth.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/create-lead/:id', authenticateUserAdminSuperAdminSession, createLeadVal, createLead);
app.post('/add-lead-office', authenticateUserAdminSuperAdminSession, addLeadOfcVal, addLeadOffices);
app.put('/update-lead/:lead_id', authenticateUserAdminSuperAdminSession, updateLeadVal, updateLead);
app.put('/update-lead-office/:lead_id/:office_id', authenticateUserAdminSuperAdminSession, updateLeadOfcVal, updateLeadOffices);
app.post('/add-lead-contact/:id', authenticateUserAdminSuperAdminSession, addLeadContactVal, addLeadContact);
app.put('/update-lead-contact/:lead_id/:contact_id', authenticateUserAdminSuperAdminSession, updateLeadContactVal, updateLeadContact);
app.delete('/archive-lead/:lead_id', authenticateAdminSuperAdminSession, updateLeadVal, archiveLead);
app.get('/fetch-lead-table-detail/:id', authenticateUserAdminSuperAdminSession, logOutVal, fetchLeadTableDetails);
app.get('/get-lead-detail/:lead_id', authenticateUserAdminSuperAdminSession, updateLeadVal,  fetchLeadDetails);
app.get('/fetch-lead-log-list/:id', authenticateUserAdminSuperAdminSession, logOutVal, fetchLeadLogDetails);
app.get('/fetch-industry-type', authenticateUserAdminSuperAdminSession,  fetchIndustryType);
app.get('/search/:id', authenticateUserAdminSuperAdminSession, searchTermInLead);
app.get('/search-term/:id', authenticateUserAdminSuperAdminSession, searchTermInLeadsPage);
app.post('/insert-lead-data-from-excel/:id', upload.single('file'), authenticateSuperAdminSession,  insertLeadsDataFromExcel); 
app.post('/insert-lead-comment-data-from-excel/:id', upload.single('file'), authenticateSuperAdminSession,  insertLeadsCommentDataFromExcel); 
app.get('/matching-company-records', authenticateUserAdminSuperAdminSession,  fetchMatchingLeadsRecords);
app.post('/fetch-inactive-leads/:id', authenticateUserAdminSuperAdminSession,  fetchInactiveLead);
app.post('/fetch-assigned-unassigned-leads/:id', authenticateAdminSuperAdminSession,  fetchAssignedUnassignedLead);
app.post('/fetch-todays-followup-leads/:id', authenticateUserAdminSuperAdminSession,  fetchTodaysFollowupLead);
app.get('/fetch-lead-type-count/:id', authenticateUserAdminSuperAdminSession,  fetchAllDifferentLeadTypesCount);


app.post('/add-company-brand', authenticateUserAdminSuperAdminSession, createManagingBrandAccount);
app.get('/fetch-company-brands', authenticateUserAdminSuperAdminSession, fetchManagingBrandRecords);


app.use("/", router);

export default app;