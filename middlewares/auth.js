const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

module.exports = () => (req, res, next) => {
    const token = req.headers['x-authorization'];

    try {
        if (token) {
            const user = jwt.verify(token, SECRET);
            req.user = user;
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid access token. Please sign in.' })
    }
};