// RiderController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('../models/user');

var googleMapsClient = require("../googleAPI");

// ADD THIS PART
// // CREATES A NEW Rider
// router.post('/', function (req, res) {
//     User.create({
//             firstName : req.body.name,
//         },
//         function (err, rider) {
//             if (err) return res.status(500).send("There was a problem adding the information to the database.");
//             res.status(200).send(rider);
//         });
// });
// // RETURNS ALL THE RIDERS IN THE DATABASE
// router.get('/', function (req, res) {
//     Rider.find({}, function (err, rider) {
//         if (err) return res.status(500).send("There was a problem finding the riders.");
//         res.status(200).send(rider);
//     });
// });

//This function returns an array of drivers (with limited info) within 10 miles of a given rider's position
router.get("/:rider/nearbyDrivers", (req, res) => {
    User.findOne({name: req.params.rider}, (err, rider) => {
        User.find({role: "driver"}, (err, drivers) => {
            let nearbyDrivers = [];
            const tenMiles = 16093.4; //meters

            let apiRequests = [];

            drivers.forEach(function(checkDriver){
                if (checkDriver.position.lat){
                    apiRequests.push(googleMapsClient.distanceMatrix({
                        origins: rider.position,
                        destinations: checkDriver.position
                    }, (err, response) => {
                        if (!err) {
                            if(response.json.rows[0].elements[0].distance.value <= tenMiles){
                                let nearDriver = {
                                    name: checkDriver.name,
                                    position: checkDriver.position,
                                    vehicleType: checkDriver.vehicleType,
                                    vehiclePlate: checkDriver.vehiclePlate,
                                    avgRating: checkDriver.avgRating
                                };
                                nearbyDrivers.push(nearDriver);
                            }
                        }
                    }).asPromise());
                }
            });

            Promise.all(apiRequests).then(() => {
                return res.json(nearbyDrivers);
            });
        });
    });
});

router.put("/:rider/driver", (req, res) => {
    User.findOne({name: req.body.name}, (err, driver) => {
        User.findOne({name: req.params.rider}, (err, rider) => {
            driver.rider = rider._id;
            driver.save((err) => {
                rider.driver = driver._id;
                rider.save((err) => {
                    res.json(rider);
                });
            });
        });
    });
});

router.get("/:rider", (req, res) => {
    User.findOne({name: req.params.rider}, (err, user) => {
        return res.json(user);
    })
})

router.put("/:rider/location", (req, res) => {
    User.findOneAndUpdate({name: req.params.rider}, {position: req.body.location}, (err, rider) => {
        return res.json(rider.position);
    });
});

router.put("/:rider/destination", (req, res) => {
    googleMapsClient.geocode({
        address: req.body.location
    }, (err, response) => {
        if (err) res.status(500).json({"msg": err});
        User.findOneAndUpdate({name: req.params.rider},
            {destination: response.json.results[0].geometry.location}, (err, user) => {
                return res.json(response.json.results[0].geometry);
            })
    });
});

router.get("/:rider/driver", (req, res) => {
    User.findOne({name: req.params.rider}).populate("driver").exec((err, rider) => {
        if (!rider.driver) return res.status(500).json({"msg": "You do not have a driver assigned."});

        // We only expose the following:
        driverObj = {
            name: rider.driver.name,
            position: rider.driver.position,
            vehicleType: rider.driver.vehicleType,
            vehiclePlate: rider.driver.vehiclePlate,
            avgRating: rider.driver.avgRating
        }

        return res.json(driverObj);
    });
});

router.post("/:rider/driver/rate", (req, res) => {
    if (req.body.rating > 5 || req.body.rating < 1) res.statusCode(401).json({"msg": "Invalid rating."});
    User.findOne({name: req.params.rider}, (err, rider) => {
        User.findById(rider.driver, (err, driver) => {
            driver.ratings.push(req.body.rating);

            // Recompute the average rating.
            sum = driver.ratings.reduce(function(a, b) { return a + b; });
            avg = sum / driver.ratings.length;
            driver.avgRating = avg;
            driver.save((err, driver) => {
                return res.json(driver.avgRating);
            });
        });
    });
});

// displays fare, trip length as reported by directions API (if location set)
router.get("/:rider/routeinfo", (req, res) => {
    User.findOne({name: req.params.rider}, (err, rider) => {
        if (!rider.destination.lat) return res.status(400).json({msg: "You must set a destination first."});
        if (!rider.position.lat) return res.status(400).json({msg: "You must set a position first."});
        googleMapsClient.directions({origin: rider.position, destination: rider.destination}, (err, response) => {
            if (err) return res.status(500).json(err);
            // Consistant with Uber's pricing, we're charging 2 dollars per mile + 1 dollar base fee
            const BASE_FARE = 1;
            const RATE_PER_MILE = 2;
            const METERS_PER_MILE = 1609.344;

            // Google returns distances in meters.
            let fare = BASE_FARE + response.json.routes[0].legs[0].distance.value / METERS_PER_MILE * RATE_PER_MILE;
            fare = +fare.toFixed(2);

            // We're going to just return the full route data + the fare.
            // The client can do what it needs to with that.
            const route = response.json.routes[0].legs[0];
            route.fare = fare;
            return res.json(route);
        });
    });
});

module.exports = router;