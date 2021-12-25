const { Schema, model } = require('mongoose');

const { categories } = require('../config');

const schema = new Schema({
    _ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, ref: 'User' },
    category: { type: String, enum: categories, required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 1500 },
    imageUrl: { type: String, match: /^https?:\/\// },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    _likesCount: { type: Number },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true }
)

module.exports = model('Topic', schema);