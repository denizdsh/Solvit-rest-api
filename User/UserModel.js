const { Schema, model } = require('mongoose');

const { categories } = require('../config');

const urlRegexp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    imageUrl: { type: String, match: urlRegexp },
    followingCategories: [{ type: String, enum: categories }],
    savedTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }]
});

module.exports = model('User', schema);