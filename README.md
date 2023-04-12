<h1>myFlix Backend API</h1>
<p>The myFlix Backend API is a Node.js and Express application that provides movie information to users, 
 allowing them to view and manage their favorite movies, 
directors, and genres. It is built using REST architecture and follows the requirements outlined in the project description provided by Careerfoundry during
 their full-stack web developer bootcamp.</p>
    <h2>Features</h2>
<ul>
    <li>Return a list of all movies</li>
    <li>Return data about a single movie by title</li>
    <li>Return data about a genre by name</li>
    <li>Return data about a director by name</li>
    <li>Allow new users to register</li>
    <li>Allow users to update their user info</li>
    <li>Allow users to add a movie to their list of favorites</li>
    <li>Allow users to remove a movie from their list of favorites</li>
    <li>Allow existing users to deregister</li>
    <li>Optional: Allow users to see which actors star in which movies</li>
    <li>Optional: Allow users to view information about different actors</li>
    <li>Optional: Allow users to view more information about movies, such as release date and rating</li>
    <li>Optional: Allow users to create a "To Watch" list in addition to their "Favorite Movies" list</li>
</ul>

<h2>Technologies Used</h2>
<ul>
    <li>Node.js</li>
    <li>Express</li>
    <li>MongoDB</li>
    <li>Mongoose</li>
    <li>body-parser (middleware)</li>
    <li>morgan (middleware)</li>
    <li>JSON Web Token (JWT) for authentication and authorization</li>
    <li>Render.com for deployment</li>
</ul>

<h2>Getting Started</h2>
<ol>
    <li>Clone the repository from GitHub.</li>
    <li>Install the dependencies using <code>npm install</code>.</li>
    <li>Set up your MongoDB database and provide the connection URL in a <code>.env</code> file.</li>
    <li>Start the server using <code>npm start</code>.</li>
    <li>The API will now be running at <code>http://localhost:8080</code>.</li>
</ol>

<h2>API Endpoints</h2>
<ul>
    <li><code>GET /movies</code>: Returns a list of all movies.</li>
    <li><code>GET /movies/:title</code>: Returns data about a single movie by title.</li>
    <li><code>GET /genres/:name</code>: Returns data about a genre by name.</li>
    <li><code>GET /directors/:name</code>: Returns data about a director by name.</li>
    <li><code>POST /users</code>: Allows new users to register.</li>
    <li><code>PUT /users/:username</code>: Allows users to update their user info.</li>
    <li><code>POST /users/:username/movies/:movieId</code>: Allows users to add a movie to their list of favorites.</li>
    <li><code>DELETE /users/:username/movies/:movieId</code>: Allows users to remove a movie from their list of favorites.</li>
    <li><code>DELETE /users/:username</code>: Allows existing users to deregister.</li>
</ul>

<h2>Authentication and Authorization</h2>
<p>The API includes user authentication and authorization using JSON Web Token (JWT). Users need to register and log in to access certain endpoints, such as adding or removing movies from their favorites list.</p>

<h2>Data Validation</h2>
<p>The API includes data validation logic to ensure that only valid data is accepted. This includes validation of user inputs, such as ensuring that required fields are provided and that data is in the correct format.</p>

<h2>Data Security</h2>
<p>The API meets data security regulations by implementing secure authentication and authorization mechanisms using JWT. User passwords are hashed and stored securely in the database to protect user information. Additionally, the API uses HTTPS to encrypt data transmitted over the network.</p>

<h2>Testing with Postman</h2>
<p>The API can be tested using Postman, a popular API testing tool. Postman allows you to send HTTP requests to the API endpoints and view the responses to ensure that the API is functioning correctly. You can use Postman to test various scenarios, such as registering a new user, logging in, and making authenticated requests.</p>

<h2>Deployment</h2>
<p>The API source code is hosted on GitHub, a publicly accessible platform. It can be cloned and deployed to a local or remote server. The API is also deployed to Render, a cloud platform, for easy access and testing. The Render deployment URL is: <code>https://martalexa-myflix.onrender.com/</code></p>

<h2>Conclusion</h2>
<p>The myFlix Backend API is a powerful and secure Node.js and Express application that provides movie information to users. It follows REST architecture, uses MongoDB as the database, and includes user authentication, authorization, data validation, and data security features. With the API deployed to Render, it is easily accessible and ready for use in your web applications.</p>

<h2>Contact</h2>
<p>If you have any questions or feedback, please feel free to contact the API maintainer at [martalexa@gmail.com]</p>

