import express, { Router } from 'express';
import multer from 'multer';
import { addAssigneeVal, addCommnentVal } from '../../../utils/validation.js';
import { addAssigneeToLead, addComments, getLeadLogDetails, updateAssigneeToLead } from '../controllers/leadCommunicationController.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
import { authenticateAdminSuperAdminSession } from '../../../middlewares/admiin&SuperAdminAuth.js';
import { authenticateUserAdminSuperAdminSession } from '../../../middlewares/allThreeRoleAuth.js';

const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/add-assignee', authenticateUserAdminSuperAdminSession, addAssigneeVal, addAssigneeToLead);
app.post('/update-assignee', authenticateAdminSuperAdminSession, addAssigneeVal, updateAssigneeToLead);
app.post('/add-comments/:id/:lead_id', authenticateUserAdminSuperAdminSession, addCommnentVal,  addComments);
app.get('/fetch-lead-log-details/:lead_id', authenticateUserAdminSuperAdminSession,  getLeadLogDetails);


app.use("/", router);

export default app;