import express , { Router } from 'express';
import { tenantRegistration } from '../controllers/tenantController.js';
import { tenantRegVal } from '../../../utils/validation.js';


const app = express();
const router = Router();

app.post("/resgiter" , tenantRegVal , tenantRegistration);



app.use('/' , router);

export default app;