import express from 'express';
import {adminController} from '../app/controllers/AdminController.js';

const router = express.Router();

router.get('/', adminController.show);

export {router};