var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Accel = require('ui/accel');

var parseFeed = function(data, quantity){  
  var items = [];
  for(var i = 0; i < quantity; i++){
     // Always upper case the description string
    var title = data.list[i].weather[0].main;
    title = title.charAt(0).toUpperCase() + title.substring(1);

    // Get date/time substring
    var time = data.list[i].dt_txt;
    time = time.substring(time.indexOf('-') + 1, time.indexOf(':') + 3);

    // Add to menu items array
    items.push({
      title:title,
      subtitle:time
    });
  }
  return items; // return the array
};

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// Splash text element
var text = new UI.Text({
  position: new Vector2(0,0),
  size: new Vector2(144, 168),
  text: 'Fetching available commands...',
  font: 'ARIAL_24',
  color: 'black',
  textOverflow: 'wrap',
  textAlign: 'center',
  backgroundColor: 'white'
});

splashWindow.add(text);
splashWindow.show();

// Make ajax request
ajax(
  {
    url:'http://api.openweathermap.org/data/2.5/forecast?q=London',
    type:'json'
  },
  function(data) {
    // Create an array of Menu items
    var menuItems = parseFeed(data, 10);

    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Available Commands',
        items: menuItems
      }]
    });

    // Add an action for SELECT
resultsMenu.on('select', function(e) {
  // Get that forecast
  var forecast = data.list[e.itemIndex];

  // Assemble body string
  var content = data.list[e.itemIndex].weather[0].description;

  // Capitalize first letter
  content = content.charAt(0).toUpperCase() + content.substring(1);

  // Add temperature, pressure etc
  content += '\nTemperature: ' + Math.round(forecast.main.temp - 273.15) + '°C' 
  + '\nPressure: ' + Math.round(forecast.main.pressure) + ' mbar' +
    '\nWind: ' + Math.round(forecast.wind.speed) + ' mph, ' + 
    Math.round(forecast.wind.deg) + '°';

      // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:'Details',
        subtitle:e.item.subtitle,
        body: content
      });
      detailCard.show();
    });

    // Show the Menu, hide the splash
    resultsMenu.show();
    splashWindow.hide();
    
    // Register for 'tap' events
    resultsMenu.on('accelTap', function(e) {
      ajax({
          url: 'https://api.twilio.com/2010-04-01/Accounts/ACb36008b90fe062ce85cea28126fef00c/SMS/Messages.json',
          data: { Body: 'open garage',
                  To: '+17024275113',
                 From: '+17024307158' },
          headers: { Authorization: 'Basic ' + base64_encode('ACb36008b90fe062ce85cea28126fef00c:c78c76f1fbab13a565c46225b6976c07') },
        }, function success(){
            console.log("Success");
        }, function failure(){
            console.log("Failure");
        });   
      });       

    // Prepare the accelerometer
    Accel.init();
  });

function base64_encode(input) {
	var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4, output = '', i = 0;
	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) { enc3 = enc4 = 64; } else if (isNaN(chr3)) { enc4 = 64; }
		output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
		chr1 = chr2 = chr3 = enc1 = enc2 = enc3 = enc4 = '';
	} while (i < input.length);
	return output;
}
