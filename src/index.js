import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import { route } from './routes/index.js';
import { readConfigFromFile } from "./app/constants/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3009;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources', 'views'))

route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    readConfigFromFile();
});