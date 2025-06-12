import express, { Router } from 'express';
import multer from 'multer';
import { addAssigneeVal, addCommnentVal } from '../../../utils/validation.js';
import { addAssigneeToLead, addComments, getLeadLogDetails } from '../controllers/leadCommunicationController.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';

const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/add-assignee', authenticateAdminSession, addAssigneeVal, addAssigneeToLead);
app.post('/add-comments/:id/:lead_id', authenticateUserAdminSession, addCommnentVal,  addComments);
app.get('/fetch-lead-log-details/:lead_id', authenticateUserAdminSession,  getLeadLogDetails);


app.use("/", router);

export default app;