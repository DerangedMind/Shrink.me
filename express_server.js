const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")
const PORT = process.env.PORT || 8080 // default port 8080

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2":  {
    longURL: "http://www.lighthouselabs.ca",
    user: "asdfa"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user: "fdsa"
  }
}

const users = {
  "asdfa": {
    user: "asdfa",
    username: "hello",
    email: "banana@id.com",
    password: "hello",
    urls: ["b2xVn2"]
  },
  "fdsa": {
    user: "fdsa",
    username: "yo",
    email: "banan@ud.com",
    password: "hello",
    urls: ["9sm5xK"]
  }
}

// if i want to not repeat myself,
// we could create our own middleware
// 

// GET for URLs ----------------------------------

app.get("/", (req, res) => {
  res.render("pages/urls_index", {
      urlDB: urlDatabase,
      userDB: users,
      user: req.cookies.user
    })
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL].longURL}`)
})

app.get("/urls/", (req, res) => {
  if (req.cookies.user === undefined) {
    res.redirect('/login')
    return
  }
  
  const userURLs = getUserURLs(users[req.cookies.user.userID])

  res.render("pages/urls_index", {
    urlDB: userURLs,
    user: req.cookies.user
  })
})

app.get("/urls/new", (req, res) => {
  if (req.cookies.user === undefined) {
    res.redirect('/login')
    return
  }
  res.render("pages/urls_new", {
    urlDB: urlDatabase,
    user: req.cookies.user
  })
})

app.get("/urls/:id", (req, res) => {
  if (req.cookies.user.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  res.render("pages/urls_show", { 
    urlDB: urlDatabase,
    user: req.cookies.user,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  })
})

// GET for Login/Signup -------------------------------------

app.get("/logout", (req, res) => {
  res.clearCookie('user')
  res.redirect(`/urls`)
})

app.get("/login", (req, res) => {
  res.render("pages/urls_login", {
    urlDB: urlDatabase,
    user: req.cookies.user
  })
})

app.get("/register", (req, res) => {
  res.render('pages/urls_register', {
    urlDB: urlDatabase,
    user: req.cookies.user
  })
})


// CRUD for URLs --------------------------------------------

// Add URL
app.post("/urls", (req, res) => {
  if (req.cookies.user === undefined) {
    res.redirect('/login')
    return
  }

  let shortURL = generateRandomString(req.body['longURL'])
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = req.body['longURL']

  urlDatabase[shortURL].userID = req.cookies.user.userID

  res.redirect(`/urls/${shortURL}`);
})

// Edit URL
app.post("/urls/:id", (req, res) => {
  if (req.cookies.user.userID !== urlDatabase[req.params.id].userID) {
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
  if (req.cookies.user.userID !== urlDatabase[req.params.id].userID) {
    res.redirect(403, '/urls')
    return
  }
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`)
})


// Account Login/Signup ----------------------------------------

// Login
app.post("/login", (req, res) => {
  const passLookup = matchToPassword(req.body['emailOrUsername'])
  if (!passLookup[0]) {
    res.send(403)
  }
  else if (bcrypt.compareSync(req.body['password'], users[passLookup[1]].password)) {
    res.cookie('user', users[passLookup[1]])
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
  res.cookie('user', user)

  res.redirect(`/urls`)
})

// ------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

// ------------------------------------------------------

function createNewUser(req) {
  const userID = generateRandomString()
  
  users[userID] = { }
  users[userID].userID = userID
  users[userID].username = req.body['username']
  users[userID].email = req.body['email']

  const password = req.body['password']
  const hashed_password = bcrypt.hashSync(password, 10)
  users[userID].password = hashed_password
  users[userID].urls = {}

  return users[userID]
}

function getUserURLs(userID) {
  let urls = {  }

  for (let i = 0; i < userID['urls'].length; i++) {
    urls[userID['urls'][i]] = urlDatabase[userID['urls'][i]]
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