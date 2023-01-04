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

let users = [
    {
        "id": "1",
        "name": "Bob",
        "favoriteMovies": []
    },
    {
        "id": "2",
        "name": "Elza",
        "favoriteMovies": ["Title2"]
    }
];

let movies = [
    {
        "Title": "Title1",
        "Description": "...",
        "Genre": {
          "Name": "Action",
          "Decrpition": "...",
        },
        "Director": {
            "Name": "Lucas",
            "Bio": "...",
            "Birth": 1990.01,
        }
      },
      {
        "Title": "Title2",
        "Description": "...",
        "Genre": {
          "Name": "Action",
          "Decrpition": "...",
        },
        "Director": {
            "Name": "...",
            "Bio": "...",
            "Birth": 1999.01,
        }
      }
];

//READ - list all users
app.get('/users', (request, response) => {
    response.status(200).json(users)
});

//READ - list all movies
app.get('/movies', (request, response) => {
    response.status(200).json(movies)
});

//READ - show information about a movie by title 
app.get('/movies/:title', (request, response) => {
    const { title } = request.params; //object destructuring
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        response.status(200).json(movie);
    } else {
        response.status(400).send('no such movie')
    }
});

//READ - return data about a genre
app.get('/movies/genre/:genreName', (request, response) => {
    const { genreName } = request.params; //object destructuring
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        response.status(200).json(genre);
    } else {
        response.status(400).send('no such genre')
    }
});

//READ - return data about a director 
app.get('/movies/directors/:directorName', (request, response) => {
    const { directorName } = request.params; //object destructuring
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        response.status(200).json(director);
    } else {
        response.status(400).send('no such director')
    }
});

//CREATE - allow user to register (add new user)
app.post('/users', (request, response) => {
    const newUser = request.body;

    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        response.status(201).json(newUser)
    } else {
        response.status(400).send('users need names')
    }
});

//UPDATE - allow users to update their user info (username)
app.put('/users/:id', (request, response) => {
    const { id } = request.params;
    const updateUser = request.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updateUser.name;
        response.status(200).json(user);
    } else {
        response.status(400).send('no such user')
    }
});

//CREATE - add a new movie to user's favorite movies array
app.post('/users/:id/:movieTitle', (request, response) => {
    const { id, movieTitle } = request.params;
    const updateUser = request.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        response.status(200).send(`${movieTitle} has been added to user ${id}'s array`)
    } else {
        response.status(400).send('the movie needs a title')
    }
});

//DELETE a movie from user's favorite movies list
app.delete('/users/:id/:movieTitle', (request, response) => {
    const { id, movieTitle } = request.params;
    const updateUser = request.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        response.status(200).send(`${movieTitle} has been removed from user ${id}'s array`)
    } else {
        response.status(400).send('the movie needs a title')
    }
});

//DELETE the user (deregister)
app.delete('/users/:id', (request, response) => {
    const { id } = request.params;
    const updateUser = request.body;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        response.status(200).send(`user ${id} has been deleted`)
    } else {
        response.status(400).send('no such user')
    }
});

app.listen(8080, () => {console.log('listening to port 8080');
});

//error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });