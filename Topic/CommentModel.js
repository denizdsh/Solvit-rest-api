const { Schema, model } = require('mongoose');

const schema = new Schema({
    _ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, ref: 'User' },
    authorImageUrl: { type: String, match: /^https?:\/\// },
    content: { type: String, required: true, minlength: [1, 'Comment must be at least 1 character long.'], maxlength: [1000, 'Comment can\'t be longer than 1000 characters.'] },
}, { timestamps: true }
)

module.exports = model('Comment', schema);