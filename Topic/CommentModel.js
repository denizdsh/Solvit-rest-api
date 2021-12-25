const { Schema, model } = require('mongoose');

const schema = new Schema({
    _ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, ref: 'User' },
    authorImageUrl: { type: String, match: /^https?:\/\// },
    content: { type: String, required: true, maxlength: [1000, 'Comment must be below 1000 characters long.'] },
}, { timestamps: true }
)

module.exports = model('Comment', schema);