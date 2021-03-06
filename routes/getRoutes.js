const { Db } = require("mongodb");
const axios = require("axios")
const router = require("express").Router();
const db = require("../models");
const API = require("../utils/API")
const cors = require("cors")
const mongoose = require("mongoose")

router.use(cors( {origin: ["http://localhost:3000","https://plantit-site.herokuapp.com"]} ))


router.get("/plant/:slug", (req, res) => {
  db.Plant.findOne({ slug: req.params.slug })
    .then(dbPlant => {
      if(dbPlant === null) {
        res.send("doesn't exist yet")
      }
      db.Comment.find({ plantId: dbPlant._id })
        .populate("userId",["username","_id"])
        .then(dbComment => {
          res.send({ dbPlant, dbComment })
        }, err => { res.send(err) });
    }, err => { res.send(err) });
})

router.get('/findByComments',(req, res) => {
  db.Comment
  .aggregate([
    {$sortByCount: "$plantId"},
    {$lookup: {
      from: "plants", 
      localField: "_id",
      foreignField: "_id",
      as: "plantInfo"
    }},

])
  .limit(3)
  .then(dbComment => {
    res.send(dbComment)
  })
})


// Get all plants from Trefle
router.get("/allplants/:usertoken", (req, res) => {
  API.getAllPlants(req.params.usertoken)
  .then((result) => {
    res.json(result.data)
  })
    .catch((err) => {
      res.json(err)
    })
})

// Search Trefle API for plant
router.get("/api/search/:query/:usertoken/:page", (req, res) => {

  API.searchPlant(req.params.query, req.params.usertoken, req.params.page).then((result) => {
    const dataFormatted = API.formatSearchResults(result.data);
    res.json(dataFormatted)
  })
  .catch((err) => {
    res.json(err)
  })
})


// Returns all plants in the database
router.get("/plants", (req, res) => {
  db.Plant.find({}).lean().then(dbPlants => {
    res.json(dbPlants)
  })
    .catch((err) => {
      res.json(err)
    })
})

//Search database for plants
router.get("/plants/search/:query", (req, res) => {
  db.Plant.find({ $text: { $search: req.params.query } })
    .then(results => {
      if (results.length===0) {
        return res.send(null)
      } else {
        res.json(results)
      }
    })
    .catch((err) => {
      res.json(err)
    })
})

// Get info from API using the slug key
router.get("/api/slug/:query/:usertoken/info", (req, res) => {
  API.searchSlug(req.params.query, req.params.usertoken)
    .then(result => {
      res.json(result.data)
    })
    .catch((err) => {
      res.json(err)
    })
})


router.get("/user/:id", (req, res) => {
  db.User.findById(req.params.id)
  .select("username email myPlants myGarden myGardenImg location skills interests")
  .populate("myPlants")
  .lean().then(dbUsers => {
    res.json(dbUsers)
  })
  .catch(err => {
    res.send(err)
  })
})

router.get("/myplants/:id", (req, res) => {
  if (req.params.id) {
    db.User.findById(req.params.id)
    .populate("myPlants")
    .lean().then(user => {
      res.json(user.myPlants)
    }).catch(err => {
      res.send(err)
    })
  } else {
    return res.status(404).send("user not found")
  }
})

router.get("/api/gardenimgs", (req,res) => {
  db.User.find({}).lean().then(users => {
    const data = users.map(user => {
      return {username:user.username,myGardenImg:user.myGardenImg}
    })
      res.json(data)
  }).catch(err => {
      res.status(500)
  })
})

module.exports = router;
