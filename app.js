const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "scytale",
    resave: false,
    saveUninitialized: false,
    cookie: {},
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/scytaleDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  prNumber: Number,
  title: String,
  description: String,
  author: String,
  status: String,
  labels: String,
  creationDate: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
  User.find({}, function (err, usersFound) {
    if (err) {
      console.log(err);
    } else {
        res.render("table", { users: usersFound });
    }
  });
})

app.get("/prs", function (req, res) {
  User.find({}, function (err, usersFound) {
    if (err) {
      console.log(err);
    } else {
        res.render("home", { users: usersFound });
    }
  });
});


// app.get("/prs/filter", function (req, res) {
//     var sortedUsers = [];
//     var j = 0;
//     User.find({}, function (err, usersFound) {
//       if (err) {
//         console.log(err);
//       } else {
//         //   res.render("home", { users: usersFound });
//         for(i = usersFound.length - 1; i > -1 ; i--){
//             sortedUsers[j] = usersFound[i];
//             j++;
//         }
//         res.render("home", { users: sortedUsers });
//       }
//     });
// });

app.post("/prs", function (req, res) {
    User.find({}, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundUsers.length);
            newUser = new User({
                prNumber: foundUsers.length + 1,
                title: req.body.title,
                description: req.body.description,
                author: req.body.author,
                status: req.body.status,
                labels: req.body.labels,
                creationDate: new Date().toISOString().slice(0, 10)
            });
            newUser.save().then(function () {
            User.find({}, function (err, foundUser) {
              if (err) {
                console.log(err);
              } else {
                res.redirect("/prs");
              }
            });
          });
        }
    });
});

app.get("/prs/delete", function(req, res){
  User.deleteMany({}, function (err) {
    if (err) {
        console.log(err);
    }
    else {
      res.redirect("/prs");
    }
  });
})



// *** API *** //

app.route("/prs/list")
// Fetches all pull requests
  .get(function (req, res) {
    User.find({}, function (err, usersFound) {
      if (usersFound) {
        res.send(usersFound)
      } else {
        res.send("No Results");
      }
    });
  })
  // Creats a new pull request
  .post(function (req, res) {

    User.find({}, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            console.log(req.body.title);
            newUser = new User({
                prNumber: foundUsers.length + 1,
                title: req.body.title,
                description: req.body.description,
                author: req.body.author,
                status: req.body.status,
                labels: req.body.labels,
                creationDate: new Date().toISOString().slice(0, 10)
            });
            newUser.save().then(function (err) {
                if(!err){
                    res.send("Success;")
                }
                else {
                    res.send("Fail")
                }
          });
        }
    });

  });


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
