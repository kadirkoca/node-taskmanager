const mongoose = require('mongoose')
const DBURL = process.env.DB_URL+'/'+process.env.DB_NAME
mongoose.connect(DBURL,{})
