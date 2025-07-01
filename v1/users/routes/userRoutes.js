import express, { Router } from 'express';
import multer from 'multer';
import { logOutVal, setUserRoleVal, setUserStatusVal, userLogVal, userRegVal } from '../../../utils/validation.js';
import { changeUserRole, fetchActiveUsersList, fetchUserDetail, fetchUsersList, setUserStatus, updateUserData, userLogin, userLogout, userRegistration } from '../controllers/userController.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
import { authenticateUserAdminSuperAdminSession } from '../../../middlewares/allThreeRoleAuth.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/add-new-user', authenticateAdminSession, userRegVal, userRegistration);
app.post('/login', userLogVal,  userLogin);
app.get('/logout/:id', logOutVal, userLogout);
app.put('/active-status', authenticateUserAdminSession, setUserStatusVal, setUserStatus);
app.put('/update-user-role', authenticateAdminSession, setUserRoleVal, changeUserRole);
app.put('/update-user/:id', authenticateUserAdminSession, updateUserData);
app.get('/fetch-user-detail/:id', authenticateUserAdminSuperAdminSession, logOutVal, fetchUserDetail);
app.get('/fetch-active-user-list', authenticateUserAdminSession, fetchActiveUsersList);
app.get('/fetch-all-user-list', authenticateAdminSession, fetchUsersList);


app.use("/", router);

export default app; 