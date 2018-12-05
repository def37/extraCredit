// Admin API routes definition file.
var express = require("express");
var passport = require("./auth").passport;
var jwt = require("jsonwebtoken");
var User = require("../models/user");

router = new express.Router();

function addUser(req, res, type) {
    newuser = new User({
        name: req.body["name"],
        password: req.body["password"] || "",
        role: type
    });

    newuser.save((err, user) => {
        if (err) {
            return res.err(err);
        } else {
            return res.json(user);
        }
    });
}

router.post("/addDriver", (req, res) => {
    addUser(req, res, "driver");
})


router.post("/addAdmin", (req, res) => {
    addUser(req, res, "admin");
})

router.post("/addRider", (req, res) => {
    addUser(req, res, "rider");
})

module.exports = router