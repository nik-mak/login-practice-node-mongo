const express = require("express")

const cors = require('cors')
const apiV1Routes = require('./routes')

const app = express();

app.use(cors())

app.use('/api/v1/', apiV1Routes)

module.exports = app