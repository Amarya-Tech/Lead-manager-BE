import express, { Router } from 'express';
import multer from 'multer';
import { logOutVal, setUserStatusVal, userLogVal, userRegVal } from '../../../utils/validation.js';
import { setUserStatus, userLogin, userLogout, userRegistration } from '../controllers/userController.js';
const app = express()
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.post('/register', userRegVal, userRegistration);
app.post('/login', userLogVal,  userLogin);
app.get('/logout/:id', logOutVal, userLogout);
app.patch('/active-status', setUserStatusVal, setUserStatus);


app.use("/", router);

export default app;