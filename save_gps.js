let jnet  = require('./json_net');
let api = require('termux-api').default;

let client = jnet.JSONSocket();

function send(counter) {

  setTimeout(function() {

    if ( counter == 0 ) {
      client.jwrite({ command: "login", username: process.argv[4], password: process.argv[5] }, send(++counter));
    }else if ( counter == 4) {
      client.jwrite({ command: "end"});
    }else if ( counter == 3){
      client.jwrite({ command: "get", username: process.argv[4] },send(++counter));
    }else{
      let result = api.createCommand()
                  .location()
                  .fromGPSProvider()
                  .requestOnce()
                  .build()
                  .run();

      result.getOutputObject()
          .then(function(location) {
              console.log('Last known location: ', location);
              client.jwrite({ command: "put", username: process.argv[4], latitude: location.latitude, longitude: location.longitude, altitude: location.altitude, timestamp: Math.floor(new Date() / 1000)},send(++counter));
          }).catch((error)=>{ console.error("Failed!", error);});
    }

  }, 1000 );

}

client.on('connect', function() {
  send(0);
});

client.on('error', (err) => {
  throw err;
});

if ( process.argv.length == 6 ){
  let hostname = process.argv[2];
  let port = process.argv[3];
  client.connect(port, hostname);
}else{
  console.log("Usage: node save_gps.js hostname port")
}
