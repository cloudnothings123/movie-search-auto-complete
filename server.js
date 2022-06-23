const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
require('dotenv').config()
const PORT = 8000

let db,
    dbConnectionString = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionString)
    .then(client => {
        console.log('Connected to database.')
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended : true})) //enables reading URLs
app.use(express.json()) //enables reading JSON
app.use(cors()) //enables using cors

app.get('/search', async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                '$Search' : {
                    'autocomplete' : {
                        'query' : `${req.query.query}`,
                        'path' : 'title',
                        'fuzzy' : {
                            'maxEdits' : 2, //user can make 2 spelling errors in search
                            'prefixLength' : 3 //user must type at least 3 characters before search starts
                        }
                    }
                }
            }
        ]).toArray() //don't forget to make things into arrays at the end
        res.send(result)
    } catch (error) {
        res.status(500).send({message : error.message})
    }
})

app.get('/get/:id', async (req,res) => {
    try {
        let result = await collection.findOne({
            '_id' : ObjectId(req.params.id)
        })
        res.send(result)
    } catch (error) {
        res.status(500).send({message : error.message})
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log('Server is running.')
})