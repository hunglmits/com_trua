import { config } from "../constants/constants.js";
import fs from 'fs';

class HomeController {
    // [GET] /
    index(req, res) {
        let _config = config.data;
        _config.forEach((quan, index) => {
            fs.readdir(`src/public/images/${quan.value}`, (err, files) => {
                _config[index]['images'] = files;
            });
        });
        console.log(`Receive request from ${req.get('host') + req.originalUrl}`);
        res.render('home', {
            config: _config
        });
    }
}

const homeController = new HomeController;

export {homeController}