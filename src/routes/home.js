import express from 'express';
import {homeController} from '../app/controllers/HomeController.js';

const router = express.Router();

router.get('/', homeController.index);

export {router};