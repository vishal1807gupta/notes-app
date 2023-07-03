const mongoose = require('mongoose');
const DB = "mongodb+srv://vishal1807gupta:geM4qy3L5zJYm5EB@cluster0.dhzjhrj.mongodb.net/inotebook?retryWrites=true&w=majority";
const mongooseURI =DB;

const connectToMongo = ()=>{
    mongoose.set('strictQuery', false);
    mongoose.connect(mongooseURI,()=>{
        console.log("Connected to mongo successfully");
    })
}

module.exports = connectToMongo;
