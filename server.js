const express = require('express');
const app = express();
const { MongoClient } = require("mongodb");
const PORT = process.env.PORT || 8000;

// Initialize MiddleWare
// We use to Install Body parser but now it is a built in middleware
// Function of express.It parses incoming JSON payload

app.use(express.json({ extended: false }));

const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://0.0.0.0:27017');
        console.log('LOG')
        const db = client.db("mern-blog");
        console.log(db);
        await operations(db);
        client.close();
    } catch (error) {
        console.log(JSON.stringify(error, undefined, 2));
        res.status(500).json({ message: "Error Connecting to database", error });
    }
}

app.get('/api/articles/:name', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;
        const articlesInfo = await db
            .collection('articles')
            .findOne({ name: articleName });
        console.log(articlesInfo);
        res.status(200).json(articlesInfo);
    }, res)
});

app.post('/api/articles/:name/add-comments', (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;
    withDB(async (db) => {
        const articlesInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName }, {
            $set: {
                comments: articlesInfo.comments.concat({ username, text }),
            },
        });
        const updateArticlesInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json(updateArticlesInfo);
    }, res)
})

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));