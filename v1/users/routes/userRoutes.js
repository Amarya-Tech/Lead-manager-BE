import express, { Router } from 'express';
import multer from 'multer';
import { logOutVal, setUserRoleVal, setUserStatusVal, userLogVal, userRegVal } from '../../../utils/validation.js';
import { changeUserRole, setUserStatus, userLogin, userLogout, userRegistration } from '../controllers/userController.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/register', userRegVal, userRegistration);
app.post('/login', userLogVal,  userLogin);
app.get('/logout/:id', logOutVal, userLogout);
app.patch('/active-status', authenticateUserAdminSession, setUserStatusVal, setUserStatus);
app.patch('/update-user-role', authenticateAdminSession, setUserRoleVal, changeUserRole);


app.use("/", router);

export default app;