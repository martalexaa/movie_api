const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Passport LocalStrategy
 *
 * @param {Object} options - The options for LocalStrategy.
 * @param {string} options.usernameField - The field name for username in the request body.
 * @param {string} options.passwordField - The field name for password in the request body.
 * @param {function} verify - The verify callback function.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    /**
     * Verify callback for LocalStrategy
     *
     * @param {string} username - The username provided in the request body.
     * @param {string} password - The password provided in the request body.
     * @param {function} callback - The callback function to invoke after verification.
     */
    (username, password, callback) => {
      console.log(username + "  " + password);
      Users.findOne({ Username: username }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (!user) {
          console.log("Incorrect username or password.");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        if (!user.validatePassword(password)) {
          console.log("incorrect password");
          return callback(null, false, {
            message: "Incorrect password or username.",
          });
        }
        console.log("finished");
        return callback(null, user);
      });
    }
  )
);

/**
 * Passport JWTStrategy
 *
 * @param {Object} options - The options for JWTStrategy.
 * @param {function} verify - The verify callback function.
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret'
    },
    /**
     * Verify callback for JWTStrategy
     *
     * @param {Object} jwtPayload - The payload extracted from JWT.
     * @param {function} callback - The callback function to invoke after verification.
     */
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
