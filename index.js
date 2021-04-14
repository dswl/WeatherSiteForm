#!/usr/bin/nodejs

// INDEX 5 - https
//



// -------------- load packages -------------- //
var express = require('express');
var app = express();
var path = require('path');
var hbs = require('hbs');
var  https = require('https');


// -------------- hbs initialization -------------- //

var partial_directory = path.join(__dirname,'views','partials');
hbs.registerPartials(partial_directory, function (err) {});
app.set('view engine', 'hbs');

// -------------- static folder initialization -------------- //

app.use(express.static('static'))

var numberFacts = [
    ['Zero is zero', ' 0 = 0', ' 0 * 0 = 0'],
    ['One is the first whole number', ' 1+1-1=1', ' 1*1=1'],
    ['Two is the number of hands I have', ' sqrt(2+2) = 2', ' 2+2-2=2'],
    ['There are five letters in three', ' the square of 3 is 9', ' 3 is a cool number'],
    ['Four is a perfect square', ' four is the number of wheels most consumer grade cars have', ' bruh has four letters in it'],
    ['Five is my favorite number', ' 25 is the square of 5', ' 5-5=0'],
    ['Six has three numbers', ' 2*3=6', ' 6^2=36'],
    ['Seven is a prime number', ' 10-3=7', ' seven has five letters in it'],
    ['I have eight fingers excluding thumbs', ' 8^2=64', ' 8+8-8=8'],
    ['Nine is a perfect square', ' 3+2+1+3=9', ' 100-91=9'],
    ['Ten is the number of fingers I have', ' 2*5=10', ' ten has 3 letters in it']
]
// -------------- express 'get' handlers -------------- //
app.get('/', function(req,res) {

    res.render('index')

});

app.get('/labs', function(req,res) {

    res.render('labs')

});

app.get('/undefined', function(req,res) {

    res.render('undefined')

});

app.get('/weatherform', function(req,res) {

    res.render('weatherform')

});

app.get('/funform', function(req,res) {

    res.render('funform')

});

app.get('/funformend', function(req,res) {

    var dict_facts = {
        name : req.query.name,
        age : req.query.age,
        color : req.query.color,
        pokemon : req.query.pokemon,
        birthday : req.query.birthday
    }
    res.render('funformend', dict_facts)

});


working = true
app.get('/getweather', [doDownload,getLocationData], function(req,res) {

    if(!working)
    {
        console.log("final interation arrived! working is false, "+working)
        working = true
        res.render('undefined')
    }
    else{
        var render_dictionary = {
            information: [
                'The current temperature at the specified location is '+globtemperature+globtemperatureUnit+"!",
                'These values are for latitude: '+res.locals.lat+" and longitude: "+res.locals.long,
                'Which is '+res.locals.city+", "+res.locals.state,
                globshortForcast,
                'There is a windspeed of '+globwindSpeed+" in the "+globwindDirection+" direction.",
                'These values are accurate from '+globstartTime+" to "+globendTime+".",
            ]
        }
        res.render('temperature_page', render_dictionary)
    }

});

function doDownload(req,res,next) {

    console.log("NEW CALL OF METHOD -------------------------")

    var points = 'https://api.weather.gov/points/42.9356,-78.8692'
    var url = 'https://api.weather.gov/gridpoints/BUF/35,47/forecast/hourly'
    newurl = 'https://api.weather.gov/gridpoints/BUF/35,47/forecast/hourly'
    var options =  { headers : {
    		'User-Agent': 'request'
    	}
    }
    res.locals.lat = 35
    res.locals.long = 47
    working=true

    if ((!isNaN(req.query.lat) && !isNaN(req.query.long)))
    {   
        var lat = Math.round(Number(req.query.lat)*10000)/10000
        var long = Math.round(Number(req.query.long)*10000)/10000
        var points = 'https://api.weather.gov/points/'+lat+','+long

        https.get(points, options, function(response) {
    
            var rawData = '';
            response.on('data', function(chunk) {
                rawData += chunk;
            });
      
            response.on('end', function() {
                var obj = JSON.parse(rawData);
                if(obj.properties == undefined){
                    console.log("OBJ DEEMED AS UNDEFINED!!!!")
                    working = false
                    next()
                }
                else{
                    newurl = obj.properties.forecastHourly;
                    console.log("new url has been set: "+newurl)
                    res.locals.city = obj.properties.relativeLocation.properties.city;
                    res.locals.state = obj.properties.relativeLocation.properties.state;
                    next()
                }
            });

      
          }).on('error', function(e) {
            console.error(e);
          });  
            
        
        //console.log(res.locals.newurl)
        var options =  { headers : {
    		'User-Agent': 'request'
    	    }
        }
        res.locals.lat = lat
        res.locals.long = long
    
    }
    else{
        https.get(url, options, function(response) {
        
          var rawData = '';
          response.on('data', function(chunk) {
              rawData += chunk;
          });

          response.on('end', function() {
              var obj = JSON.parse(rawData);
              res.locals.temperature = obj.properties.periods[0].temperature;
              res.locals.temperatureUnit = obj.properties.periods[0].temperatureUnit;
              res.locals.startTime = obj.properties.periods[0].startTime;
              res.locals.endTime = obj.properties.periods[0].endTime;
              res.locals.windSpeed = obj.properties.periods[0].windSpeed;
              res.locals.windDirection = obj.properties.periods[0].windDirection;
              res.locals.city = 'Buffalo'
              res.locals.state = 'NY'
              res.locals.long = '47 (These are the default values) \n WARNING: Unless you passed no lat or long arguments, your values may have errored. Default cords provided.'
              next()
          });

        }).on('error', function(e) {
            console.error(e);
        });    
    }
}


function getLocationData(res,req,next)
{
    if(working == false){
        next()
    }
    if(newurl == undefined)
    {
        newurl = 'https://api.weather.gov/gridpoints/BUF/35,47/forecast/hourly'
    }
    
    console.log("THIS FUNCTION HAS BEEN REACHED ------------------")
    console.log("This is the requested URL: "+newurl)

    var options =  { headers : {
            'User-Agent': 'request'
        }
    }

    https.get(newurl, options, function(response) {


        var newrawData = '';
        response.on('data', function(chunk) {
            newrawData += chunk;
        });
  
        response.on('end', function() {
            //console.log("This is the raw data: "+newrawData)
            convertedData = JSON.parse(newrawData)
            //console.log("this is the parsed data: "+convertedData)
            var newobj = JSON.parse(newrawData);

            if(newobj == undefined){
                console.log("OBJ DEEMED AS UNDEFINED!!!!")
                working = false
                next()
            }
            else{
                globtemperature = newobj.properties.periods[0].temperature;
                //console.log('this is the temp: '+res.locals.temperature);
                globtemperatureUnit = newobj.properties.periods[0].temperatureUnit;
                //console.log("temperature: "+temperature)
                globstartTime = newobj.properties.periods[0].startTime;
                globendTime = newobj.properties.periods[0].endTime;
                globwindSpeed = newobj.properties.periods[0].windSpeed;
                globwindDirection = newobj.properties.periods[0].windDirection;
                globshortForcast = newobj.properties.periods[0].shortForecast;
                arrayOfData = [globtemperature, globtemperatureUnit, globstartTime, globendTime, globwindSpeed, globwindDirection]
                console.log(arrayOfData)
                next()
            }
        });
  
      }).on('error', function(e) {
          console.error(e);
      });
}


app.get('/:page_as_var', function(req, res){
    var number = Number(req.params.page_as_var);
    //console.log(number)

    if (isNaN(number)){
        //Load the Page here
        //console.log(number+" was not considered a number")
        res.render('undefined')
    }
    else if(number>10 || number<0){
        res.send('INVALID INPUT: Your number was either lower than 0 or greater than 10! Cringe!')
    }
    else if(!isNaN(req.query.num_facts)){  // number facts is numerisized!
        if(req.query.num_facts>0 && req.query.num_facts<=3){
            var dict_facts = {
                chosenNumber : number,
                factsList : numberFacts[number].slice(0,req.query.num_facts),
                numberOfFacts : req.query.num_facts
            }
            if(req.query.format == "json"){  // json format is requested
                res.send(dict_facts)
            }
            else{res.render('numbers', dict_facts)}
        }
        else{res.send('INVALID INPUT: You requested an invalid number of facts! Request a number more than 0 and at most 3! Cringe!')}
    }
    else{
        var dict_facts = {
            chosenNumber : number,
            factsList : numberFacts[number],
            numberOfFacts : 3
        }
        //console.log(numberFacts)
        //console.log(dict_facts)
        //console.log(number+" was considered a number")
        if (req.query.format == "json"){  // json format is requested
            res.send(dict_facts)
        }
        else{res.render('numbers',dict_facts)}
        
    }
})

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(process.env.PORT || 80, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});