const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT || 8080 // default port 8080

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/", (req, res) => {
  res.render("pages/urls_index", {
      links: urlDatabase
    })
})

app.get("/urls/", (req, res) => {
  res.render("pages/urls_index", {
    links: urlDatabase
  })
})

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new")
})

app.get("/urls/:id", (req, res) => {
  let urlID = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  }
  res.render("pages/urls_show", urlID)
})


app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]}`)
})

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






