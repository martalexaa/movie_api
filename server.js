const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

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

//CREATE - allow user to register (add new user)
app.post('/users', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(({Username: user.Username, Email: user.Email})) })
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
app.put('/users/:Username', passport.authenticate( 'jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { 
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
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

app.listen(8080, () => {console.log('listening to port 8080');
});

//error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });