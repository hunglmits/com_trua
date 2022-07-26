class AdminController {
    // [GET] /admin
    show(req, res) {
        res.render('admin');
    }
}

const adminController = new AdminController;

export {adminController}