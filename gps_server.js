let jnet = require('./json_net');

let server = new jnet.JSONServer();

let sqlite3 = require('sqlite3').verbose();
let dbFile = "gpsdata.db";

server.data = {};

server.on('json_connection',function(jsocket) {

  var responses = {

    put: function(object) {
      var valid = true;
      var errMsg = "";

      if( !(object.hasOwnProperty('username')) ){
        valid = false;
        errMsg += "username is missing in data. ";
      }else{
        let type = typeof (object.username);
        if ( type != 'string' ){
          valid = false;
          errMsg += "username is not a string. ";
        }
      }

      if( !(object.hasOwnProperty('latitude')) ){
        valid = false;
        errMsg += "latitude is missing in data. ";
      }else{
        let type = typeof (object.latitude);
        if ( type != 'number' ){
          valid = false;
          errMsg += "latitude is not number. ";
        }
      }

      if( !(object.hasOwnProperty('longitude')) ){
        valid = false;
        errMsg += "longitude is missing in data. ";
      }else{
        let type = typeof (object.longitude);
        if ( type != 'number' ){
          valid = false;
          errMsg += "longitude is not number. ";
        }
      }

      if( !(object.hasOwnProperty('altitude')) ){
        valid = false;
        errMsg += "altitude is missing in data. ";
      }else{
        let type = typeof (object.altitude);
        if ( type != 'number' ){
          valid = false;
          errMsg += "altitude is not number. ";
        }
      }

      if( !(object.hasOwnProperty('timestamp')) ){
        valid = false;
        errMsg += "timestamp is missing in data.";
      }else{
        let type = typeof (object.timestamp);
        if ( type != 'number' || (object.timestamp) < 0 || (object.timestamp) % 1 != 0){
          valid = false;
          errMsg += "timestamp is not a positive integer.";
        }
      }

      if ( valid ){
        let query = "INSERT INTO Gpsdata \
                    (Latitude, Longitude, Altitude, SentTime, ReceiveTime, UserId) \
                    VALUES (?, ?, ?, ?, ?,\
                    (SELECT UserId \
                      FROM User\
                      WHERE User.Username = ?))";
        let rectime = Math.floor(new Date() / 1000);
        let db = new sqlite3.Database(dbFile);
        let stmt = db.prepare(query);
        stmt.run(object.latitude, object.longitude, object.altitude, object.timestamp, rectime, object.username);
        stmt.finalize();
        db.close();
        server.data[object.username] = {latitude: object.latitude, longitude: object.longitude, altitude: object.altitude, timestamp: object.timestamp, received: rectime };
        jsocket.jwrite({ put: server.data[object.username]});
        console.log(server.data);
      }else{
        jsocket.error(errMsg);
      }
    },

    get: function(object) {
      if( object.hasOwnProperty('username') ){
        let key_type = typeof (object.username);
        if ( key_type == 'string' ){
          let query = "select Latitude, Longitude, Altitude, SentTime, ReceiveTime\
                      from Gpsdata inner join User on Gpsdata.UserId = User.UserId\
                      where User.Username = ?";
          let db = new sqlite3.Database(dbFile);
          var queryResult = {};
          db.each(query, object.username, function(err, row) {
            console.log(row.Latitude, row.Longitude, row.Altitude, row.SentTime, row.ReceiveTime);
            queryResult["Timestamp: " + row.SentTime] = {latitude: row.Latitude, longitude: row.Longitude, altitude: row.Altitude, received: row.ReceiveTime };
          }, function(err, rows){
              jsocket.jwrite({ result: queryResult});
          });
          db.close();
        }else{
          jsocket.error("the username is not a string");
        }
      }else{
        jsocket.error("the command is not well formed");
      }
    },

    login: function(object) {
      if( object.hasOwnProperty('username') ){
        let db = new sqlite3.Database(dbFile);
        db.all("SELECT * FROM user where Username = ?", object.username, function(err, rows) {
          var login = false;
          rows.forEach(function (row) {
            login = (row.Password == object.password);
          })
          if ( rows.length == 0 && object.hasOwnProperty('password') && typeof (object.password) == 'string') {
            var stmt = db.prepare("INSERT INTO user(Username, Password) VALUES(?,?)");
            stmt.run(object.username, object.password);
            stmt.finalize();
            login = true;
          }
          if( login ){
            if ( !(server.data.hasOwnProperty('username'))){
              server.data[object.username] = {};
            }
            jsocket.jwrite({ result: "Logged in"});
          }else{
            jsocket.error({ result: "Invalid user name or password"});
          }
        });
        db.close();
      }else{
        jsocket.error("username is missing");
      }
    },

    end: function(object,socket) {
      jsocket.end();
    }

  }

  jsocket.on('json', function(object) {

    if ( responses[object.command] ) {
      if (object.command != 'login' && object.command != 'end'){
        if( server.data.hasOwnProperty(object.username) ){
            responses[object.command](object);
        }else{
          jsocket.error("not yet acquainted");
        }
      }else{
        responses[object.command](object);
      }
    } else {
      jsocket.error("Unknown command '" + object.command + "'");
    }

  });

  jsocket.on('json_error', function(err) {
    jsocket.jwrite({error: err.message});
  });

});

server.on('error', (err) => {
  throw err;
});

server.listen(8080, () => {
  console.log('server bound');
});
