const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.JWT_SECRET;

// Local strategy is used for generating JWTs
passport.use(new localStrategy((user, password, cb) => {
        // here is where we would do a DB call usually, stubbed until DB
        if (user === "rider", password === "rider"){
            user = {id: 1, role: "rider"}
        }
        else if (user === "driver", password === "driver"){
            user = {id: 2, role: "driver"}
        }
        else if (user === "admin", password === "admin"){
            user = {id: 3, role: "admin"}
        } else {
            return cb(null, false, {message: 'Incorrect user/password.'})
        }
        return cb(null, user, {message: "Logged in."});
    }
));

passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    console.log(jwtPayload);
    return done(null, jwtPayload);
}));

exports.passport = passport;