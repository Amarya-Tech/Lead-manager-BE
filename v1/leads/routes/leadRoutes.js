import express, { Router } from 'express';
import multer from 'multer';
import { addLeadContactVal, addLeadOfcVal, createLeadVal, updateLeadContactVal, updateLeadOfcVal, updateLeadVal } from '../../../utils/validation.js';
import { addLeadContact, addLeadOffices, archiveLead, createLead, updateLead, updateLeadContact, updateLeadOffices } from '../controllers/leadController.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/create-lead/:id', createLeadVal, createLead);
app.post('/add-lead-office', addLeadOfcVal, addLeadOffices);
app.put('/update-lead/:lead_id', updateLeadVal, updateLead);
app.put('/update-lead-office/:lead_id/:office_id', updateLeadOfcVal, updateLeadOffices);
app.post('/add-lead-contact/:id', addLeadContactVal, addLeadContact);
app.put('/update-lead-contact/:lead_id/:contact_id', updateLeadContactVal, updateLeadContact);
app.delete('/archive-lead/:lead_id', updateLeadVal, archiveLead);


app.use("/", router);

export default app;