const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT || 8080 // default port 8080

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const users = {

}

// if i want to not repeat myself,
// we could create our own middleware
// 

// GET ----------------------------------

app.get("/", (req, res) => {
  res.render("pages/urls_index", {
      links: urlDatabase,
      userID: req.cookies.userID
    })
})

app.get("/register/", (req, res) => {
  res.render('pages/urls_register', {
    links: urlDatabase,
    userID: req.cookies.userID
  })
})

app.get("/urls/", (req, res) => {
  res.render("pages/urls_index", {
    links: urlDatabase,
    userID: req.cookies.userID
  })
})

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new", {
    userID: req.cookies.userID
  })
})

app.get("/urls/:id", (req, res) => {
  res.render("pages/urls_show", { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    userID: req.cookies.userID
  })
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]}`, {
    userID: req.cookies.userID
  })
})

app.get("/logout", (req, res) => {
  res.clearCookie('userID')
  res.redirect(`/urls`)
})

// app.get("/login", (req, res) => {
//   res.render("pages/urls_login")
// })

// POST ----------------------------------


// Add URL
app.post("/urls", (req, res) => {
  console.log(req.body);

  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL] = req.body

  res.redirect(`/urls/${shortURL}`);
})

// Edit URL
app.post("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id]
  
  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL]
  res.redirect(`/urls/${shortURL}`);
})

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`)
})

// Login
app.post("/login", (req, res) => {
  res.cookie('username', req.body['username'])
  console.log(res.cookies, req.body['username']);
  res.redirect(`/urls`)
})

// Register
app.post("/register", (req, res) => {
  if (req.body['username'] === "" || req.body['email'] === "" || req.body['password'] == "") {
    res.status(400);

    return
  }
  var userID = generateRandomString();
  users[userID] = { }
  users[userID].userID = userID
  users[userID].username = req.body['username']
  users[userID].email = req.body['email']
  users[userID].password = req.body['password']
  console.log(users)
  res.cookie('userID', users[userID])

  res.redirect(`/urls`)
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString() {
  let randomString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  
  for (let i = 0; i < 6; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)]
  }

  return randomString;
}