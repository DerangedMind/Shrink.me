const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT || 8080 // default port 8080

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// GET ----------------------------------

app.get("/", (req, res) => {
  res.render("pages/urls_index", {
      links: urlDatabase,
      username: req.cookies.username
    })
})

app.get("/urls/", (req, res) => {
  res.render("pages/urls_index", {
    links: urlDatabase,
    username: req.cookies.username
  })
})

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new", {
    username: req.cookies.username
  })
})

app.get("/urls/:id", (req, res) => {
  let urlID = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  }
  res.render("pages/urls_show", urlID)
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]}`, {
    username: req.cookies.username
  })
})

app.get("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect(`/urls`)
})

// POST ----------------------------------

app.post("/urls", (req, res) => {
  console.log(req.body);

  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL] = req.body

  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id]
  
  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL]
  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`)
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body['username'])
  console.log(res.cookies, req.body['username']);
  res.redirect(`/urls`)
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString(longURL) {
  let randomString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  
  for (let i = 0; i < 6; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)]
  }

  urlDatabase[randomString] = longURL
  return randomString;
}




/*

key - value  delete
key - value  delete
key - value  delete

shorturl - longurl 



*/






