function auth(req, res, next) {
    if(req.session.username) {
        return next();
    }
    return res.status(401).send('error de autorización')
}

module.exports = { auth }