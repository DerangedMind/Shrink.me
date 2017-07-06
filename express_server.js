const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT || 8080 // default port 8080

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2":  {
    longURL: "http://www.lighthouselabs.ca",
    userID: "asdfa"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "asdfa"
  }
}

const users = {
  "asdfa": {
    userID: "asdfa",
    username: "hello",
    email: "banana@id.com",
    password: "hello",
    urls: ["b2xVn2", "9sm5xK"]
  }
}

// if i want to not repeat myself,
// we could create our own middleware
// 

// GET for URLs ----------------------------------

app.get("/", (req, res) => {
  res.render("pages/urls_index", {
      links: urlDatabase,
      userID: req.cookies.userID
    })
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]}`, {
    userID: req.cookies.userID
  })
})

app.get("/urls/", (req, res) => {
  if (req.cookies.userID === 'undefined') {
    res.redirect('/')
    return
  }
  res.render("pages/urls_index", {
    links: urlDatabase,
    userID: req.cookies.userID
  })
})

app.get("/urls/new", (req, res) => {
  if (req.cookies.userID === 'undefined') {
    console.log(req.cookies)
    res.redirect('/login')
    return
  }
  res.render("pages/urls_new", {
    userID: req.cookies.userID
  })
})

app.get("/urls/:id", (req, res) => {
  if (req.cookies.userID.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  res.render("pages/urls_show", { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userID: req.cookies.userID
  })
})

// GET for Login/Signup -------------------------------------

app.get("/logout", (req, res) => {
  res.clearCookie('userID')
  res.redirect(`/urls`)
})

app.get("/login", (req, res) => {
  res.render("pages/urls_login", {
    userID: req.cookies.userID
  })
})

app.get("/register", (req, res) => {
  res.render('pages/urls_register', {
    links: urlDatabase,
    userID: req.cookies.userID
  })
})


// CRUD for URLs --------------------------------------------

// Add URL
app.post("/urls", (req, res) => {
  if (req.cookies.userID === 'undefined') {
    res.redirect('/login')
    return
  }

  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = req.body['longURL']
  urlDatabase[shortURL].userID = req.cookies.userID.userID
  console.log(urlDatabase)

  res.redirect(`/urls/${shortURL}`);
})

// Edit URL
app.post("/urls/:id", (req, res) => {
  if (req.cookies.userID.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  delete urlDatabase[req.params.id]
  
  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL]
  res.redirect(`/urls/${shortURL}`);
})

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies.userID.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`)
})


// Account Login/Signup ----------------------------------------

// Login
app.post("/login", (req, res) => {
  if (req.cookies.userID !== 'undefined') {
    res.redirect('/')
    return
  }
  var passLookup = matchToPassword(req.body['emailOrUsername'])
  if (!passLookup[0]) {
    res.send(403)
  }
  else if (users[passLookup[1]].password === req.body['password']) {
    res.cookie('userID', users[passLookup[1]])
    res.redirect(`/`)
  } 
})

// Register
app.post("/register", (req, res) => {
  if (req.body['username'] === "" || 
        req.body['email'] === "" || 
        req.body['password'] == "" || 
        emailOrUserExists(req.body['email'], req.body['username'])) {
    
    res.redirect(400, `/register`);
    return
  }
  
  let userID = generateRandomString();
  
  users[userID] = { }
  users[userID].userID = userID
  users[userID].username = req.body['username']
  users[userID].email = req.body['email']
  users[userID].password = req.body['password']
  users[userID].urls = {}
  console.log(users)
  res.cookie('userID', users[userID])

  res.redirect(`/urls`)
})

// ------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

// ------------------------------------------------------

function matchToPassword(loginInfo, password) {
  var userID = ""
  for (let user in users) {
    userID = users[user].userID
    if (users[user].email === loginInfo || users[user].username === loginInfo) {
      return [true, userID];
    }
  }
  return [false, null];
}

function emailOrUserExists(loginInfo) {
  // {...} in asdfas
  for (let user in users) {
    if (users[user].email === loginInfo || users[user].username === loginInfo) {
      return true;
    }
  }
  return false;
}

function generateRandomString() {
  let randomString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  
  for (let i = 0; i < 6; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)]
  }

  return randomString;
}