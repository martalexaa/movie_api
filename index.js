/**

@fileoverview Entry point of the myFlix application backend.
@module app
@requires mongoose
@requires ./models.js
@requires express-validator
@requires find-config
@requires dotenv
@requires fs
@requires path
@requires body-parser
@requires uuid
@requires cors
@requires ./auth
@requires passport
@requires ./passport
*/

const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const findConfig = require('find-config');
require('dotenv').config({ path: require('find-config')('.env') });

const Movies = Models.Movie;
const Users = Models.User;

mongoose.set('strictQuery', true);

//connect to local database when testing locally
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


/**
connect to online database using enviormental variable
*/
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express'),
  app = express(),
  morgan = require('morgan');
fs = require('fs'), // import built in node modules fs and path 
  path = require('path');
bodyParser = require('body-parser'),
  uuid = require('uuid');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

// This variable creates a stream for logging requests to log.txt
app.use(morgan('combined', { stream: accessLogStream }));

//serves files from the 'public' folder
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  //bodyParser middleware function

// Import CORS and setting up an array that contains allowed origins for CORS policy
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234',
  'https://martalexa-myflix.onrender.com', 'https://martalexaa-movie-app.netlify.app', 'http://localhost:4200', 
                      'https://martalexaa.github.io/myFlix-Angular-client', 'https://martalexaa.github.io'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a origin is not on the list of allowed origins
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


let auth = require('./auth')(app); //import the “auth.js” file into the project

const passport = require('passport');
require('./passport');

/**
Sends a welcome message on the main page.
@function
@method GET to endpoint '/'
@name welcome
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - The HTTP response object with a welcome message
*/
app.get('/', (request, response) => {
  response.send('Welcome to myFlix!');
});

/**
Retrieves a list of all users.
@function
@method GET to endpoint '/users'
@name getUsers
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - The HTTP response object with a list of users
*/
app.get('/users', passport.authenticate('jwt', { session: false }), function (request, response) {
  Users.find()
    .then(function (users) {
      response.status(200).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json("Error: " + err);
    })
});


/**
Retrieves a list of all movies.
@function
@method GET to endpoint '/movies'
@name getMovies
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - The HTTP response object with a list of movies
*/
app.get('/movies', passport.authenticate('jwt', { session: false }), (request, response) => {
  Movies.find()
    .then((movies) => {
      response.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Error: " + err);
    })
});

/**
Retrieves information about a movie by title.
@function
@method GET to endpoint '/movies/:Title'
@name getMovieByTitle
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - The HTTP response object with information about one movie
*/
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (request, response) => {
  Movies.findOne({ Title: request.params.Title })
    .then((movie) => {
      response.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Error: " + err);
    })
});

/**
Retrieves information about a genre.
@function
@method GET to endpoint '/movies/genres/:Name'
@name getGenreByName
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - The HTTP response object with information about one genre
*/
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (request, response) => {
  Movies.findOne({ "Genre.Name": request.params.Name })
    .then(function (movies) {
      response.json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json("Error: " + err);
    })
});

/**
Retrieves information about a movie director by their name.
@function
@method GET to endpoint '/movies/directors/:Name'
@name getDirectorByName
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - The HTTP response object with information about one movie director
*/
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (request, response) => {
  Movies.findOne({ "Director.Name": request.params.Name })
    .then(function (movies) {
      response.json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Error: " + err);
    })
});

/**
Allows new users to register. 
Checks if all the required fields are filled in correctly.
Hashes the password before storing it in the database.
Checks if the user already exists in the database.
@function
@method POST to endpoint '/users'
@name addUser
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - A JSON object holding the data of the newly created user
*/
app.post('/users',
  [
    check('Username', 'Username shall be at least 4 characters long.').isLength({ min: 4 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').not().isEmpty().isEmail(),
  ], (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // hash any password entered by the user when registering before storing it in the MongoDB database
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {  //checks if the user already exist
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({  //if does not exist, create a new user
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(({ user })) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

/**
Retrieves information about a specific user by the username.
@function
@method GET to endpoint '/users/:Username'
@name getUserByUsername
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - A JSON object holding the data of the user
*/
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
Allows users to update their data. 
@function
@method PUT to endpoint '/users/:Username'
@name updateUser
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - A JSON object holding the updated data of the user
*/
app.put('/users/:Username', passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required")
      .not()
      .isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        },
      },
      { new: true }, //make sure the updated document is new
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

/**
Allows users to add a new movie to their favorite movies array
@function
@method POST to endpoint /users/:Username/movies/:MovieID'
@name addFavoriteMovie
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - A JSON object holding the updated data of the user
*/
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/**
Allows users to remove a movie from their favorite movies array
@function
@method DELETE to endpoint /users/:Username/movies/:MovieID'
@name removeFavoriteMovie
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {object} - A JSON object holding the updated data of the user
*/
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID }
      },
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

/**
Allows users to delete their account from the database (deregister)
@function
@method DELETE to endpoint /users/:Username/movies/:MovieID'
@name deleteUser
@param {object} request - The HTTP request object
@param {object} response - The HTTP response object
@returns {string} -  A message about the successful deletion
*/
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove(
    { Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Start the server and listen on the specified port
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

// Error-handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
