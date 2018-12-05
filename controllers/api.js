// API routes definition file.
var express = require("express");
var passport = require("./auth").passport;
var jwt = require("jsonwebtoken");

router = new express.Router();

router.get("/", (req, res, next) => {
    res.json({'version': 1});
});

router.get("/version", (req, res, next) => {
    res.json("Hello " + req.query.name);
});

router.get("/adminProtected", passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.send("Welcome master, how may I be of service?");
});

// Auth functions.
router.get("/403", (req, res, next) => {
    res.status(403).json({message: "You are not allowed to access this page."});
});

router.get("/login", (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user ){
            return res.status(400).json({
                message: "Something went wrong",
                user: user
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }

            const token = jwt.sign(user, process.env.JWT_SECRET);
            return res.json({user, token});
        });
    })(req, res, next);
});

module.exports = router;