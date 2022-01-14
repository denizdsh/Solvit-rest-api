const express = require('express');
const mongoose = require('mongoose');

const cors = require('./middlewares/cors');
const auth = require('./middlewares/auth');

const PORT = process.env.PORT || 5000;
const db_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solvit'

const userController = require('./User/userController');
const topicController = require('./Topic/topicController');

start();

async function start() {
    await new Promise(async (resolve, reject) => {
        await mongoose.connect(db_URI);

        const db = mongoose.connection;
        db.once('open', () => {
            console.log('Database connected.');
            resolve();
        });
        db.on('error', (err) => reject(err));
    });

    const app = express();

    app.use(cors());
    app.use(auth())
    app.use(express.json());

    app.use('/', userController);
    app.use('/topics', topicController);

    app.get('/', (req, res) => {
        res.send('REST service is running.')
    })

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}