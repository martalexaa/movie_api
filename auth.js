const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

//“/login” endpoint for registered users that contains logic for authenticating users with basic HTTP authentication 
//and generating a JWT token for authenticating future requests

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //the username I'm encoding in JWT
        expiresIn: '7d', //the token will exipre in 7 days
        algorithm: 'HS256' //the algorithm used to “sign” or encode the values of the JWT
    });
}

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, 
        (error, user, info) => {
          if (error || !user) {
            return res.status(400).json({
              message: 'Something is not right',
              user: user
            });
          }
          req.login(user, { session: false }, (error) => {
            if (error) {
              res.send(error);
            }
            let token = generateJWTToken(user.toJSON());
            return res.json({ user, token });
          });
        })(req, res);
      });
    }