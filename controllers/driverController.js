// DriverController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var User = require("../models/user");

// Sets a driver availability.
router.put("/:driver/available", (req, res) => {
    User.findOneAndUpdate({ name: req.params.driver }, { isAvailable: req.body.available || false }, (err, driver) => {
        return res.json({ "isAvailable": driver.isAvailable });
    });
});

router.put("/:driver/info", (req, res) => {
    User.findOneAndUpdate({ name: req.params.driver },
        {
            vehicleType: req.body.vehicleType,
            vehiclePlate: req.body.vehiclePlate
        }, (err, driver) => {
            return res.json({ vehicleType: driver.vehicleType, plate: driver.vehiclePlate });
        });
});


router.get("/:driver/rider", (req, res) => {
    User.findOne({ name: req.params.driver }).populate("rider").exec((err, driver) => {
        // Exposed fields are rider name, position and destination.
        if (!driver.rider) return res.status(400).json({"msg": "You do not have an assigned rider."});
        const riderObj = {
            name: driver.rider.name,
            destination: driver.rider.destination,
            position: driver.rider.position
        }
        return res.json(riderObj);
    });
});

module.exports = router;