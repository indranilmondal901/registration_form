const mongoose = require("mongoose");
const url = "mongodb://localhost:27017";
const dbName = process.env.DB_NAME;
const uri = url + "/" + dbName;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
})
    .then(() => {
        console.log("mongoDb is sucessfully connected with Node.js")
    }).catch((err) => {
        console.log("not connected with MongoDb.Err is ==>" + err)
    })