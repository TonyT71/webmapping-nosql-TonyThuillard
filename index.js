var express = require("express");
var bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const client = new MongoClient("mongodb://localhost:27017");

var app = express();

async function main() {

    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("geo");
    const collection = db.collection('equip');

    app.use(bodyParser.urlencoded({ extended: false}))

    app.set("view engine", "pug");
    app.set("views", "./views");

    app.use('/static', express.static('public'));

    app.get('/', function(req, res){
        console.log("New Request!", req.query);
        res.send("Ceci est la route racine \n");
    });

// Route qui affiche le formulaire de recherche (/geo-search)
    app.get("/geo-search", function(req, res){
        res.render("form_geo");
    });

    // Route pour récupérer les données du formulaire et afficher les résultats (/geo-search-results)
    
    app.get("/geo-search-results", async function (req, res){

        var latitude = parseFloat(req.query.latitude);
        var longitude = parseFloat(req.query.longitude);
        var radius = parseFloat(req.query.radius);

        var filter = {};
        if (!latitude || !longitude || !radius) {
            return res.send("Erreur : Veuillez remplir tous les champs !");
        }

        if (Math.abs(longitude) > 0.000001 && Math.abs(latitude) > 0.000001){
            filter.geometry = {"$geoWithin": { "$center": [[longitude, latitude], radius]}};
        }
        console.log("filter", filter);

        const query = collection.find(filter).limit(100);
        const docs = await query.toArray();
        console.log("Found " + docs.lenght + " records:");
        res.render('geo-search-results', {
            results: docs
        });
    });

    app.get("/geo-search-results-json", async function (req, res){
        var latitude = parseFloat(req.query.latitude);
        var longitude = parseFloat(req.query.longitude);
        var radius = parseFloat(req.query.radius);

        var filter = {};
        if (!latitude || !longitude || !radius) {
            return res.send("Erreur : Veuillez remplir tous les champs !");
        }

        if (Math.abs(longitude) > 0.000001 && Math.abs(latitude) > 0.000001){
            filter.geometry = {"$geoWithin": { "$center": [[longitude, latitude], radius]}};
        }
        console.log("filter", filter);

        const query = collection.find(filter).limit(100);
        const docs = await query.toArray();
        console.log("Found " + docs.lenght + " records:");
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({
            "type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": docs
        }));
    });

    app.listen(3000)

}




main()
    .then(console.log)
    .catch(console.error)