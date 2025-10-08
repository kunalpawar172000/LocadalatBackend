import express from 'express';
import { getUsers, createUser, login,updatePassword } from '../controller/userController.js';


const router = express.Router();

// Route to get user profile
router.get('/profile', getUsers);
router.post('/createUser', createUser);
router.post('/login', login);
router.post('/updatePassword', updatePassword);

export default router;