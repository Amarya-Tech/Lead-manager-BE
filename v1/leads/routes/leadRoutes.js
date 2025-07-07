import express, { Router } from 'express';
import multer from 'multer';
import { addLeadContactVal, addLeadOfcVal, createLeadVal, logOutVal, updateLeadContactVal, updateLeadOfcVal, updateLeadVal } from '../../../utils/validation.js';
import { addLeadContact, addLeadOffices, archiveLead, createLead, fetchIndustryType, fetchLeadDetails, fetchLeadLogDetails, fetchLeadTableDetails, searchTermInLead, searchTermInLeadsPage, insertDataFromExcel, updateLead, updateLeadContact, updateLeadOffices, insertCompanyCommentDataFromExcel } from '../controllers/leadController.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSuperAdminSession } from '../../../middlewares/allThreeRoleAuth.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/create-lead/:id', authenticateUserAdminSession, createLeadVal, createLead);
app.post('/add-lead-office', authenticateUserAdminSession, addLeadOfcVal, addLeadOffices);
app.put('/update-lead/:lead_id', authenticateUserAdminSession, updateLeadVal, updateLead);
app.put('/update-lead-office/:lead_id/:office_id', authenticateUserAdminSession, updateLeadOfcVal, updateLeadOffices);
app.post('/add-lead-contact/:id', authenticateUserAdminSession, addLeadContactVal, addLeadContact);
app.put('/update-lead-contact/:lead_id/:contact_id', authenticateUserAdminSession, updateLeadContactVal, updateLeadContact);
app.delete('/archive-lead/:lead_id', authenticateAdminSession, updateLeadVal, archiveLead);
app.get('/fetch-lead-table-detail/:id', authenticateUserAdminSession, logOutVal, fetchLeadTableDetails);
app.get('/get-lead-detail/:lead_id', authenticateUserAdminSession, updateLeadVal,  fetchLeadDetails);
app.get('/fetch-lead-log-list/:id', authenticateUserAdminSession, logOutVal, fetchLeadLogDetails);
app.get('/fetch-industry-type', authenticateUserAdminSession,  fetchIndustryType);
app.get('/search', authenticateUserAdminSession, searchTermInLead);
app.get('/search-term/:id', authenticateUserAdminSession, searchTermInLeadsPage);
app.post('/insert-lead-data-from-excel/:id', upload.single('file'), authenticateUserAdminSuperAdminSession,  insertDataFromExcel); 
app.post('/insert-lead-comment-data-from-excel/:id', upload.single('file'), authenticateUserAdminSuperAdminSession,  insertCompanyCommentDataFromExcel); 


app.use("/", router);

export default app;