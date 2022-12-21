//the variable declarations are at the top of the code
const http = require('http'),
  fs = require('fs'),
  url = require('url');

//after the variable declarations we create a server
http.createServer((request, response) => {
    let addr = request.url, //using request.url allows you to get the URL from the request (which, in this case, is the first argument of the createServer() function
      q = url.parse(addr, true), //q is where you store the parsed URL from your user
      filePath = ''; //filePath is declared, but it's set to an empty string. This will be where you store the path of the file

      fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => { //the new information you're including in the second argument will be appended at the end of the “log.txt” file
        if (err) {
          console.log(err);
        } else {
          console.log('Added to log.');
        }
      });

      //you'll be piecing the file path together and placing it in your empty variable in the next if-else statement
      if (q.pathname.includes('documentation')) {  //this statement checks what the exact pathname of the entered URL is and if it includes 'documentation'
        filePath = (__dirname + '/documentation.html'); //If it does, it pieces together __dirname and “/documentation.html”, adding them as a complete path name to the currently empty filePath variable you already declared
      } else {
        filePath = 'index.html'; //If pathname doesn't include “documentation”, the if-else statement returns “index.html” instead
      }
    
      fs.readFile(filePath, (err, data) => { //we use the fs module to send back the appropriate file
        if (err) {
          throw err;
        }
    
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    
      });
    
    }).listen(8080); //access port 8080
    console.log('My test server is running on Port 8080.');