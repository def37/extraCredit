// Main runner.
require('dotenv').config({ path: 'process.env'});
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const chalk = require('chalk');

const apiController = require('./controllers/api');
const AdminController = require('./controllers/adminController');
const RiderController = require('./controllers/riderController');
const DriverController = require('./controllers/driverController');

// DB connect
mongoose.connect("mongodb://admin:password1@ds017193.mlab.com:17193/pokeycat")

// Config
app.set('host', process.env.HOST);
app.set('port', process.env.PORT);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Route definitions
app.use('/api', apiController);
app.use('/admin', AdminController);
app.use('/driver', DriverController);
app.use('/rider', RiderController);

module.exports = app;