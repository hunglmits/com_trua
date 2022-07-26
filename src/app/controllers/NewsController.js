class NewsController {
    // [GET] /news/:slug
    show(req, res) {
        res.render('news_detail');
    }

    // [GET] /news
    index(req, res) {
        res.render('news');
    }
}

const newsController = new NewsController;

export {newsController}