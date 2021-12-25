const { getOwnerId } = require('../Topic/topicService')

module.exports = {
    isGuest() {
        return (req, res, next) => {
            if (req.user) {
                res.status(400).json({ message: 'You are already signed in.' });
            }
            else {
                next();
            }
        }
    },
    isUser() {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ message: 'Please sign in.' });
            }
            else {
                next();
            }
        }
    },
    isOwner() {
        return async (req, res, next) => {
            const userId = req.user._id;
            const topicId = req.params.id;
            const ownerId = await getOwnerId(topicId);
            if (userId != ownerId) {
                res.status(403).json({ message: 'You are not authorized to perform this action.' });
            }
            else {
                next();
            }
        }
    }
};