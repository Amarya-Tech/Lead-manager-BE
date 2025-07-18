import express, { Router } from 'express';
import multer from 'multer';
import { logOutVal, setUserRoleVal, setUserStatusVal, userLogVal, userRegVal } from '../../../utils/validation.js';
import { changeUserRole, fetchActiveUsersList, fetchUserDetail, fetchUsersList, setUserStatus, updateUserData, userLogin, userLogout, userRegistration } from '../controllers/userController.js';
import { authenticateAdminSession } from '../../../middlewares/adminAuth.js';
import { authenticateUserAdminSession } from '../../../middlewares/userAdminAuth.js';
import { authenticateUserAdminSuperAdminSession } from '../../../middlewares/allThreeRoleAuth.js';
import { authenticateAdminSuperAdminSession } from '../../../middlewares/admiin&SuperAdminAuth.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/add-new-user', authenticateAdminSuperAdminSession, userRegVal, userRegistration);
app.post('/login', userLogVal,  userLogin);
app.get('/logout/:id', logOutVal, userLogout);
app.put('/active-status', authenticateUserAdminSuperAdminSession, setUserStatusVal, setUserStatus);
app.put('/update-user-role', authenticateAdminSuperAdminSession, setUserRoleVal, changeUserRole);
app.put('/update-user/:id', authenticateUserAdminSuperAdminSession, updateUserData);
app.get('/fetch-user-detail/:id', authenticateUserAdminSuperAdminSession, logOutVal, fetchUserDetail);
app.get('/fetch-active-user-list', authenticateUserAdminSuperAdminSession, fetchActiveUsersList);
app.get('/fetch-all-user-list', authenticateAdminSuperAdminSession, fetchUsersList);


app.use("/", router);

export default app; 