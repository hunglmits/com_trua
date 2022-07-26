import { router as adminRouter } from './admin.js';
import { router as newsRouter } from './news.js';
import { router as homeRouter } from './home.js';

function route(app) {
    app.use('/admin', adminRouter);
    app.use('/news', newsRouter);
    app.use('/', homeRouter);
}

export { route };