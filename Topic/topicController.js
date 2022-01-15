const router = require('express').Router();
const service = require('./topicService');
const { getFollowingCategories, getSavedTopics, getImageByUsername } = require('../User/userService');
const { isUser, isOwner } = require('../middlewares/guards');

router.get('/', async (req, res) => {
    const sortBy = req.query.sortBy;
    const order = req.query.order === 'desc' ? 1 : -1;

    const topics = await service.getAllTopics(sortBy, order);
    res.json(topics);
})


router.get('/c/following', isUser(), async (req, res) => {
    const sortBy = req.query.sortBy;
    const order = req.query.order === 'desc' ? 1 : -1;

    const userId = req.user._id;
    const categories = await getFollowingCategories(userId)
    
    if (!categories) {
        res.status(err.status || 400).json({ message: 'You haven\'t followed any catogies yet.' })
        return null;
    }
    
    const topics = await service.getTopicsByCategories(categories, sortBy, order);
    res.json(topics);
})

router.get('/c/saved', isUser(), async (req, res) => {
    const sortBy = req.query.sortBy;
    const order = req.query.order === 'desc' ? 1 : -1;

    const userId = req.user._id;
    const savedTopicsIds = await getSavedTopics(userId);

    try {
        const savedTopics = await service.getTopicsByIds(savedTopicsIds, sortBy, order);
        res.json(savedTopics);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.get(`/c/:category`, async (req, res) => {
    const sortBy = req.query.sortBy;
    const order = req.query.order === 'desc' ? 1 : -1;

    const category = req.params.category;
    const topics = await service.getTopicsByCategory(category, sortBy, order);

    res.json(topics);
});

router.get('/u/:user', async (req, res) => {
    const sortBy = req.query.sortBy;
    const order = req.query.order === 'desc' ? 1 : -1;

    const user = req.params.user;
    try {
        const topics = await service.getTopicsByAuthor(user, sortBy, order);
        res.json(topics);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const topic = await service.getTopicById(id);
        res.json(topic);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.get('/:id/comments', async (req, res) => {
    const id = req.params.id;

    try {
        const comments = await service.getComments(id);
        res.json(comments);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/', isUser(), async (req, res) => {
    const topic = {
        _ownerId: req.user._id,
        author: req.user.username,
        category: req.body.category || 'other',
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        _likesCount: 0
    }

    try {
        res.json(await service.createTopic(topic));
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(err.status || 400).json({ message: 'All fields required. Title can be up to 200 characters long and description can be up to 1500 characters long. Image url must be valid.' });
        } else {
            res.status(err.status || 400).json({ message: 'Database error.' });
        }
    }
})
router.put('/:id', isOwner(), async (req, res) => {
    const id = req.params.id;
    const topic = req.body;

    try {
        res.json(await service.editTopic(topic, id));
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(err.status || 400).json({ message: 'All fields required. Title can be up to 200 characters long and description can be up to 1500 characters long. Image url must be valid.' });
        } else {
            res.status(err.status || 400).json({ message: err.message });
        }
    }
})
router.delete('/:id', isOwner(), async (req, res) => {
    const id = req.params.id;
    try {
        const response = await service.deleteTopic(id);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/:id/like', isUser(), async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;

    try {
        const response = await service.likeTopic(id, userId);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})
router.post('/:id/dislike', isUser(), async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;

    try {
        const response = await service.dislikeTopic(id, userId);
        res.json(response);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

router.post('/:id/comments', isUser(), async (req, res) => {
    const id = req.params.id;
    const body = {
        _ownerId: req.user._id,
        author: req.user.username,
        authorImageUrl: await getImageByUsername(req.user.username),
        content: req.body.content.trim()
    }
    try {
        const comment = await service.postComment(id, body);
        console.log(comment)
        res.json(comment);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
})

module.exports = router;