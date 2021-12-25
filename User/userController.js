const router = require('express').Router();

const { isGuest, isUser } = require('../middlewares/guards')
const service = require('./userService');
const { categories } = require('../config');

router.post('/register', isGuest(), async (req, res) => {
    const email = req.body.email.trim().toLocaleLowerCase();
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const imageUrl = req.body.imageUrl?.trim();

    try {
        if (!email) {
            throw new Error('Email is required!');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const user = await service.register(email, username, password, imageUrl);

        res.json(user);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/login', isGuest(), async (req, res) => {
    const email = req.body.email.trim().toLocaleLowerCase();
    const password = req.body.password.trim();

    try {
        const user = await service.login(email, password);
        res.json(user);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/edit-profile', isUser(), async (req, res) => {
    const userId = req.user?._id;
    const username = req.body.username.trim();
    const imageUrl = req.body.imageUrl.trim();
    const password = req.body.password.trim();

    try {
        const response = await service.editProfile(username, imageUrl, userId, password);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }

})
router.get('/u/me/saved-topics', isUser(), async (req, res) => {
    const userId = req.user?._id;
    const savedTopics = await service.getSavedTopics(userId);
    res.json(savedTopics);
})

router.get('/u/me/following-categories', isUser(), async (req, res) => {
    const userId = req.user?._id;
    const followingCategories = await service.getFollowingCategories(userId);
    res.json(followingCategories);
})

router.get('/u/:username/image', async (req, res) => {
    const username = req.params.username;
    const image = await service.getImageByUsername(username);
    res.json(image);
})

router.post('/user-action/follow/:category', isUser(), async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    try {
        if (!userId) {
            const err = new Error('You have to be logged in to perform this action.');
            err.status = 401;
            throw err;
        }

        if (!categories.includes(category)) {
            throw new Error(`Category ${category} is not valid.`);
        }

        const response = await service.followCategory(userId, category);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/user-action/unfollow/:category', isUser(), async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    try {
        if (!userId) {
            const err = new Error('You have to be logged in to perform this action.');
            err.status = 401;
            throw err;
        }

        if (!categories.includes(category)) {
            throw new Error(`Category ${category} is not valid.`);
        }

        const response = await service.unfollowCategory(userId, category);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/user-action/save/:topicId', isUser(), async (req, res) => {
    const userId = req.user._id;
    const topicId = req.params.topicId;

    try {
        if (!userId) {
            const err = new Error('You have to be logged in to perform this action.');
            err.status = 401;
            throw err;
        }

        const response = await service.saveTopic(userId, topicId);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/user-action/unsave/:topicId', isUser(), async (req, res) => {
    const userId = req.user._id;
    const topicId = req.params.topicId;

    try {
        if (!userId) {
            const err = new Error('You have to be logged in to perform this action.');
            err.status = 401;
            throw err;
        }

        const response = await service.unsaveTopic(userId, topicId);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

module.exports = router;