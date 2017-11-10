var AWS = require("aws-sdk");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


AWS.config.loadFromPath('./awskeys.json');

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

app.listen(8080, function () {
    console.log('Server running at http://127.0.0.1:8080/');
});


app.post('/Production', function (req, res) {
    var table = 'Movies';
    var year = parseInt(req.body.year);
    var title = req.body.name;
    var rating = req.body.rating;
    var params = {
        TableName: table,
        Item: {
            "year": year,
            "title": title,
            "info": {
                "summary": 'nothing happens at all in this shit',
                "rating": rating
            }
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            res.render(__dirname + "/views/inserted.ejs", {title: req.body.name});
        }
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

app.get('/list', function (req, res) {
    var params = {
        TableName: "Movies"
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        var filmes = [];
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            data.Items.forEach(function (movie) {
                filmes.push({
                    ano: movie.year,
                    titulo: movie.title,
                    Nota: movie.info.rating
                });
            });
            console.log("Scan succeeded.");
            res.render(__dirname + "/views/list.ejs", {lista: filmes});

            if (typeof data.LastEvaluatedKey !== "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    }
});

