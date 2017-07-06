const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const cookieSession = require("cookie-session")
const PORT = process.env.PORT || 8080 // default port 8080

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieSession( {
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 24 * 60 * 60 * 1000
}))

const users = {
  "asdfa": {
    userID: "asdfa",
    username: "hello",
    email: "banana@id.com",
    password: "hello",
    urls: {
      "b2xVn2": "http://www.lighthouselabs.ca"
    }
  },
  "fdsa": {
    userID: "fdsa",
    username: "yo",
    email: "banan@ud.com",
    password: "hello",
    urls: {
      "9sm5xK": "http://www.google.com"
    }
  }
}

// if i want to not repeat myself,
// we could create our own middleware
// 

// GET for URLs ----------------------------------

app.get("/", (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }
  
  res.redirect('/urls')
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL].longURL}`)
})

app.get("/urls", (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }

  const userURLs = getUserURLs(req.session.user.userID)
  console.log(Object.keys(userURLs).length)
  res.render("pages/urls_index", {
    urlDB: urlDatabase,
    userURLs: userURLs,
    user: req.session.user
  })
})

app.get("/urls/new", (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }
  res.render("pages/urls_new", {
    urlDB: urlDatabase,
    user: req.session.user
  })
})

app.get("/urls/:id", (req, res) => {
  if (req.session.user.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  res.render("pages/urls_show", { 
    urlDB: urlDatabase,
    user: req.session.user,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  })
})

// GET for Login/Signup -------------------------------------

app.get("/logout", (req, res) => {
  req.session = null
  res.redirect(`/urls`)
})

app.get("/login", (req, res) => {
  res.render("pages/urls_login", {
    urlDB: urlDatabase,
    user: req.session.user
  })
})

app.get("/register", (req, res) => {
  res.render('pages/urls_register', {
    urlDB: urlDatabase,
    user: req.session.user
  })
})


// CRUD for URLs --------------------------------------------

// Add URL
app.post("/urls", (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }

  var shortURL = createNewURL(req)
  
  res.redirect(`/urls/${shortURL}`);
})

// Edit URL
app.post("/urls/:id", (req, res) => {
  if (req.session.user.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  delete urlDatabase[req.params.id]
  
  var shortURL = createNewURL(req)
  res.redirect(`/urls/${shortURL}`);
})

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  delete urlDatabase[req.params.id]
  delete users[req.session.user.userID].urls[req.params.id]
  res.redirect(`/urls`)

  ///////////// need to redirect but give the proper objects
})


// Account Login/Signup ----------------------------------------

// Login
app.post("/login", (req, res) => {
  const passLookup = matchToPassword(req.body['emailOrUsername'])
  if (!passLookup[0]) {
    res.send(403)
  }
  else if (bcrypt.compareSync(req.body['password'], users[passLookup[1]].password)) {
    req.session.user = users[passLookup[1]][userID]
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
  
  const user = createNewUser(req)
  req.session.user = user[userID]

  res.redirect(`/urls`)
})

// ------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

// ------------------------------------------------------

function createNewURL(req) {
  const shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = req.body['longURL']
  urlDatabase[shortURL].userID = req.session.user.userID
  users[req.session.user.userID]['urls'].push(shortURL)

  return shortURL
}

function createNewUser(req) {
  const userID = generateRandomString()
  
  users[userID] = { }
  users[userID].userID = userID
  users[userID].username = req.body['username']
  users[userID].email = req.body['email']

  const password = req.body['password']
  const hashed_password = bcrypt.hashSync(password, 10)
  users[userID].password = hashed_password
  users[userID].urls = []

  return users[userID]
}

function getUserURLs(userID) {
  let urls = {  }
  const userURLs = users[userID]['urls']
  for (let i = 0; i < users[userID]['urls'].length; i++) {

    // urls[asdf['urls'][1]] = urlDatabase[asdf['urls'][1]]
    urls[userURLs[i]] = urlDatabase[userURLs[i]]
  }

  return urls
}

function matchToPassword(loginInfo, password) {
  let userID = ""
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