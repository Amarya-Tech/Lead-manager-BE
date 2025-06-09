import express, { Router } from 'express';
import multer from 'multer';
import { logOutVal, setUserRoleVal, setUserStatusVal, userLogVal, userRegVal } from '../../../utils/validation.js';
import { changeUserRole, fetchUserDetail, fetchUsersList, setUserStatus, userLogin, userLogout, userRegistration } from '../controllers/userController.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/register', userRegVal, userRegistration);
app.post('/login', userLogVal,  userLogin);
app.get('/logout/:id', logOutVal, userLogout);
app.put('/active-status', authenticateUserAdminSession, setUserStatusVal, setUserStatus);
app.put('/update-user-role', authenticateAdminSession, setUserRoleVal, changeUserRole);
app.get('/fetch-user-detail/:id', authenticateUserAdminSession, logOutVal, fetchUserDetail);
app.get('/fetch-user-list', authenticateAdminSession, fetchUsersList);


app.use("/", router);

export default app; 