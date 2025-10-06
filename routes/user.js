import express from 'express';
import { getUsers, createUser, login } from '../controller/user.js';


const router = express.Router();

// Route to get user profile
router.get('/profile', getUsers);
// Route to update user profile
router.post('/create', createUser);
router.post('/login', login);

export default router;