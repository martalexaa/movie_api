const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const findConfig = require('find-config');
require('dotenv').config({ path: require('find-config')('.env') });

const Movies = Models.Movie;
const Users = Models.User;

mongoose.set('strictQuery', true);

//connect to local database
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


//connect to online database using enviormental variable
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const express = require('express'),
    app = express(),
    morgan = require('morgan');
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//serves files from the 'public' folder
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  //bodyParser middleware function

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 
'https://martalexa-myflix.onrender.com', 'https://martalexaa-movie-app.netlify.app'];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a origin is not on the list of allowed origins
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));


let auth = require('./auth')(app); //import the “auth.js” file into the project

const passport = require('passport');
require('./passport');

//response on main page
app.get('/', (request, response) => {
    response.send('Welcome to myFlix!');
});

//READ - list all users (with normal function)
app.get('/users', passport.authenticate( 'jwt', { session: false }), function (request, response) {
    Users.find()
    .then (function (users) {
    response.status(200).json(users);
    })
    .catch (function (err) {
    console.error(err);
    res.status(500).json("Error: " + err);
    })
});


//READ - list all movies (with arrow function)
app.get('/movies', passport.authenticate( 'jwt', { session: false }), (request, response) => {
    Movies.find()
    .then ((movies) => {
    response.status(200).json(movies);
    })
    .catch ((err) => {
    console.error(err);
    res.status(500).json("Error: " + err);
    })
});

//READ - show information about a movie by title 
app.get('/movies/:Title', passport.authenticate( 'jwt', { session: false }), (request, response) => {
    Movies.findOne({ Title: request.params.Title })
    .then ((movie) => {
    response.status(200).json(movie);
    })
    .catch ((err) => {
    console.error(err);
    res.status(500).json("Error: " + err);
    })
});

//READ - return data about a genre
app.get('/movies/genres/:Name', passport.authenticate( 'jwt', { session: false }), (request, response) => {
    Movies.findOne({ "Genre.Name": request.params.Name })
    .then (function(movies) {
    response.json(movies.Genre);
    })
    .catch ((err) => {
    console.error(err);
    response.status(500).json("Error: " + err);
    })
});

//READ - return data about a director 
app.get('/movies/directors/:Name', passport.authenticate( 'jwt', { session: false }), (request, response) => {
    Movies.findOne({ "Director.Name": request.params.Name })
    .then (function(movies) {
    response.json(movies.Director);
    })
    .catch ((err) => {
    console.error(err);
    res.status(500).json("Error: " + err);
    })
});

//CREATE - allow a new user to register (add new user)
app.post('/users', 

  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
//passport.authenticate( 'jwt', { session: false }), (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password); //hashes password when registering
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
            .then((user) =>{res.status(201).json(({ user })) })
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

  //READ - get a user by username

  app.get('/users/:Username', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  

//UPDATE - allow users to update their data
app.put('/users/:Username',   passport.authenticate("jwt", { session: false }),
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

//CREATE - add a new movie to user's favorite movies array
app.post('/users/:Username/movies/:MovieID', passport.authenticate( 'jwt', { session: false }), (req, res) => {
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


//DELETE a movie from user's favorite movies list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate( 'jwt', { session: false }),
  function(req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID }
      },
      { new: true },
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

//DELETE the user (deregister)
app.delete('/users/:Username', passport.authenticate( 'jwt', { session: false }), (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

//error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });