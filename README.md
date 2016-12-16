# GPS DATA SERVER #

**gps_server.js** is the implemented server that allows clients save their GPS coordinates along with a timestamp.

**save_gps.js** is the implemented client that tests the functionalities of the server.

**gpsdata.sql** is the query that creates a gps_coordinates table and a clients table in SQLite.

## Tools and External libraries

- json_net.js

	This is the Node.js file used in lecture and HW7. Its codes allow JSON pass through the server and clients. Using JSON forces clients send data in certain formats. If data from clients has an invalid format, the server responds back with a JSON errors. Moreover, data manipulation is easier in JSON than in plain String. It is because parsing a string could be tedious.
 
- Termux

	Termux is an Android application in Google Play. It is a Linux like termial that allows users run node.js codes in Android devices.

- Termux:API

	An Android application needs to be granted permissions before using GPS API. In application development with Java, this is done by changing AndroidManifest.xml. However, there is no documentation about how to set it up with node.js. An alternative solution is using Termux:API. It is an add-on of Termux. After the add-on is installed, users can use shell commands or node.js codes to open GPS and other Android API.
	
	Here are the steps for installing the add-on
		
		- Install Termux from Google Play if it has not been done
		- Install Termux:API from Google Play
		- Open Termux 
		- Run apt update and apt upgrade
		- Run apt install termux-api
		- Run apt install nodejs
		- Run apt install coreutils
		- Create a directory for the project 
		- Go to the directory and run npm install --save termux-api
	
- sqlite3

	It is a library used to connect SQLite database.

## Running the server

SQLite database in memory is erased once the database connection is closed. Because I didn't want to lose any data, I created a database in a physical file instead. For this reason, the first step to run the server is installing sqlite3 and creating gpsdata.db. gpsdata.db needs to be in the same directory of the project.

	sqlite3 gpsdata.db < gpsdata.sql

The next step is installing sqlite3 npm into the project's directory.

	npm install sqlite3

After the database is created and npm is installed, GPS Data Server can be started by running node gps_server.js. Currently, the server accepts three commands from clients.

##### Login or Register

    { "command": "login", "username": STRING, "password": STRING}

The Server first queries the corresponding username from the database. If a user is found and the password matches with the one in the database. The user is logged in ({ result: "Logged in"}). Otherwise, the server responds back with a JSON error. On the other hand, if the user does not exist, the server first adds the user to the database with the password in the command. Then, it responds back { result: "Logged in"}. On the other hand, if a password is missing in the command, the server responds back with a JSON error.

##### Put GPS data

    { "command": "put", "username": STRING, "latitude": NUMBER, "longitude": NUMBER, "altitude": NUMBER, "timestamp": UNIXTIME }

The Server returns a JSON error if the user is not logged in. If the user is logged in, it first verifies the data type. Then, it inserts the data into the database and sends a response back.
    
    { put: { "latitude": NUMBER, "longitude": NUMBER, "altitude": NUMBER, "timestamp": UNIXTIME, received: UNIXTIME }}

##### Get GPS data

    { "command": "get", "username": STRING }

The Server returns a JSON error if the user is not logged in. If the user is logged in, it looks for GPS data own by the user and sends a response back.

    { result: {"Timestamp: time"{ "latitude": NUMBER, "longitude": NUMBER, "altitude": NUMBER, received: UNIXTIME }}}

	{ result: {{}}} 

## Test Results

I provided four links to four different screenshots, [starting the client](https://drive.google.com/file/d/0ByTKQVoHmW0xOEhnSDlEUzRueFk/view?usp=sharing), [uploading the data](https://drive.google.com/file/d/0ByTKQVoHmW0xRkZUdngyWk4xZ2c/view?usp=sharing), [getting the data](https://drive.google.com/file/d/0ByTKQVoHmW0xZkxvaWhObng4QVk/view?usp=sharing), and [responses from the server](https://drive.google.com/file/d/0ByTKQVoHmW0xM3paMlNha0U3c2M/view?usp=sharing). They showed the client connected to the server successfully. On the server side, the server was able to receive the command, acted accordingly, and responded back. On the other hand, the client was also able to log in, send GPS data, get the data, and close the connection. The next test plan will be running the server on AWS. Then, I will take my phone to different places and see if the client will be able to send GPS data to the server successfully.


## Future extensions

One extension is making the connection secure. I will probably look at the documentation about npm ssh2 to find out how to create an ssh connection between clients and the server. Another extension is making the database secure and looking for a way to encrypt the password. Finally, I would love to explore how to install GPS module in my computer, control the module with Arduino, and send GPS data to the GPS server.  

## References

* Building a Node.js application on Android - https://medium.freecodecamp.com/building-a-node-js-application-on-android-part-1-termux-vim-and-node-js-dfa90c28958f#.yrm8j45gy.

* Termux:API - https://www.npmjs.com/package/termux-api.

* Termux:API add-on - https://termux.com/add-on-api.html.

* sqlite3 - https://www.npmjs.com/package/sqlite3.

* In-Memory Databases - https://www.sqlite.org/inmemorydb.html.
