const User = require('./UserModel');
const Topic = require('../Topic/TopicModel');
const Comment = require('../Topic/CommentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { SECRET } = require('../config');

function generateJwt(user) {
    const token = jwt.sign({
        _id: user._id,
        email: user.email,
        username: user.username,
    }, SECRET)

    return token;
}

async function register(email, username, password, imageUrl) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        const err = new Error(`Account with email ${email} already exists`);
        err.status = 409;
        throw err;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        const err = new Error(`Account with username (${username}) already exists`);
        err.status = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        email,
        username,
        hashedPassword,
        imageUrl
    })

    await user.save();

    return {
        _id: user._id,
        email: user.email,
        username: user.username,
        imageUrl: user.imageUrl,
        accessToken: generateJwt(user)
    }
}

async function login(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
        const err = new Error('Incorrect email or password');
        err.status = 401;
        throw err;
    }
    const match = await bcrypt.compare(password, user.hashedPassword);

    if (!match) {
        const err = new Error('Incorrect email or password');
        err.status = 401;
        throw err;
    }

    return {
        _id: user._id,
        email: user.email,
        username: user.username,
        imageUrl: user.imageUrl,
        accessToken: generateJwt(user)
    }
}

async function editProfile(username, imageUrl, id, password) {
    const user = await User.findById(id);
    if(!username) {
        const err = new Error('Invalid username');
    }

    if (!user) {
        const err = new Error('Invalid user or incorrect password');
        err.status = 401;
        throw err;
    }
    const match = await bcrypt.compare(password, user.hashedPassword);

    if (!match) {
        const err = new Error('Invalid user or incorrect password');
        err.status = 401;
        throw err;
    }

    if (username) user.username = username;
    user.imageUrl = imageUrl;

    await user.save();

    await Topic.updateMany({ _ownerId: id }, { author: user.username });
    await Comment.updateMany({ _ownerId: id }, { author: user.username, authorImageUrl: user.imageUrl });

    return {
        username: user.username,
        imageUrl: user.imageUrl,
    }
}

async function getSavedTopics(userId) {
    const user = await User.findById(userId);
    return user ? Array.from(user.savedTopics) || [] : [];
}

async function getSavedTopics(userId) {
    const user = await User.findById(userId);
    return user ? Array.from(user.savedTopics) || [] : [];
}

async function getImageByUsername(username) {
    const user = await User.findOne({ username });

    return user ? user.imageUrl : '';
}

async function getFollowingCategories(userId) {
    const user = await User.findById(userId);
    return user ? user.followingCategories || [] : [];
}

async function followCategory(userId, category) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('You have to be logged in to perform this action.')
        err.status = 401;
        throw err;
    }

    if (user.followingCategories.includes(category)) throw new Error(`You have already followed category ${category}.`);

    user.followingCategories.push(category);
    await user.save();
}

async function unfollowCategory(userId, category) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('You have to be logged in to perform this action.')
        err.status = 401;
        throw err;
    }

    if (!user.followingCategories.includes(category)) throw new Error(`You haven't followed category ${category} yet.`);

    user.followingCategories.splice(user.followingCategories.indexOf(category), 1);
    await user.save();
}

async function saveTopic(userId, topicId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('You have to be logged in to perform this action.')
        err.status = 401;
        throw err;
    }

    if (user.savedTopics.includes(topicId)) throw new Error('You have already followed this topic.')

    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('No such topic in database.');

    user.savedTopics.push(topicId);
    await user.save();
}

async function unsaveTopic(userId, topicId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('You have to be logged in to perform this action.')
        err.status = 401;
        throw err;
    }

    if (!user.savedTopics.includes(topicId)) throw new Error('You haven\'t followed this topic yet.')

    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('No such topic in database.');

    user.savedTopics.splice(user.savedTopics.indexOf(topicId), 1);
    await user.save();
}

module.exports = {
    register,
    login,
    editProfile,
    getSavedTopics,
    getImageByUsername,
    getFollowingCategories,
    followCategory,
    unfollowCategory,
    saveTopic,
    unsaveTopic
};