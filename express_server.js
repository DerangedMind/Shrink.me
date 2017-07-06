const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const cookieSession = require('cookie-session')
const PORT = process.env.PORT || 8080 // default port 8080

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieSession( {
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 24 * 60 * 60 * 1000
}))

// Wanted to place URL key:values into the users object,
// but this would then require the tinyURL link to search 
// each user. urlDatabase is only created so that we can
// easily lookup the key:value pair

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

const users = {
  'asdfa': {
    userID: 'asdfa',
    username: 'hello',
    email: 'banana@id.com',
    password: bcrypt.hashSync('hello', 10),
    urls: {
      'b2xVn2': 'http://www.lighthouselabs.ca'
    }
  },
  'fdsa': {
    userID: 'fdsa',
    username: 'yo',
    email: 'banan@ud.com',
    password: 'hello',
    urls: {
      '9sm5xK': 'http://www.google.com'
    }
  }
}

// Functions ------------------------------------------

function createNewURL(req) {
  const shortURL = generateRandomString()
  let longURL = req.body['longURL']
  
  // ensure URL starts w/ either http:// or https://
  if (longURL.slice(0, 7) !== 'http://' && longURL.slice(0, 8) !== 'https://') {
    longURL = `http://${longURL}`
  }

  users[req.session.user]['urls'][shortURL] = longURL
  urlDatabase[shortURL] = longURL

  return shortURL
}

function createNewUser(req) {
  const userID = generateRandomString()
  const password = req.body['password']
  const hashed_password = bcrypt.hashSync(password, 10)

  users[userID] = { }
  users[userID].userID = userID
  users[userID].username = req.body['username']
  users[userID].email = req.body['email']
  users[userID].password = hashed_password
  users[userID].urls = { }

  return users[userID]
}

function getUserURLs(userID) {
  let urls = {  }
  const userURLs = users[userID]['urls']
  for (let i = 0; i < Object.keys(userURLs).length; i++) {

    urls[userURLs[i]] = urlDatabase[userURLs[i]]
  }

  return urls
}

function emailOrUserExists(loginInfo) {
  // {...} in asdfas
  for (let userID in users) {
    if (users[userID].email === loginInfo || users[userID].username === loginInfo) {
      return [true, users[userID]]
    }
  }
  return [false, null]
}

function generateRandomString() {
  let randomString = ''
  let possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  
  for (let i = 0; i < 6; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)]
  }

  return randomString
}

// if i want to not repeat myself,
// we could create our own middleware
// 

// GET for Redirect URLs ----------------------------------

app.get('/', (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }
  res.redirect('/urls')
})

app.get('/u/:shortURL', (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]}`)
})

// GET for User URL pages ----------------------------------

app.get('/urls', (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }

  const userURLs = users[req.session.user].urls

  res.render('pages/urls_index', {
    userURLs: userURLs,
    user: users[req.session.user]
  })
})

app.get('/urls/new', (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }
  res.render('pages/urls_new', {
    user: users[req.session.user]
  })
})

app.get('/urls/:id', (req, res) => {
  if (users[req.session.user].urls[req.params.id] !== urlDatabase[req.params.id]) {
    res.redirect(403, '/urls')
    return
  }
  res.render('pages/urls_show', { 
    user: users[req.session.user], 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  })
})

// GET for Login/Signup -------------------------------------

app.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls')
})

app.get('/login', (req, res) => {
  if (req.session.user !== undefined) {
    res.redirect('/urls')
    return
  }

  // sending user for header to verify if logged in
  res.render('pages/urls_login', {
    user: users[req.session.user]
  })
})

app.get('/register', (req, res) => {
  if (req.session.user !== undefined) {
    res.redirect('/urls')
    return
  }

  // sending user for header to verify if logged in
  res.render('pages/urls_register', {
    user: users[req.session.user]
  })
})


// CRUD for URLs --------------------------------------------

// Add URL
app.post('/urls', (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }

  const shortURL = createNewURL(req)
  
  res.redirect(`/urls/${shortURL}`)
})
// TO FIX USER.USERID
// Edit URL
app.post('/urls/:id', (req, res) => {
  if (users[req.session.user].urls[req.params.id] !== urlDatabase[req.params.id]) {
    res.redirect(403, '/urls')
    return
  }
  delete users[req.session.user].urls[req.params.id]
  
  const shortURL = createNewURL(req)
  res.redirect(`/urls/${shortURL}`)
})

// Delete URL
app.post('/urls/:id/delete', (req, res) => {
  if (users[req.session.user].urls[req.params.id] !== urlDatabase[req.params.id]) {
    res.redirect(403, '/urls')
    return
  }
  delete users[req.session.user].urls[req.params.id]
  delete urlDatabase[req.params.id]
  res.redirect('/urls')

  ///////////// need to redirect but give the proper objects
})


// Account Login/Signup ----------------------------------------

// Login
app.post('/login', (req, res) => {
  const passLookup = emailOrUserExists(req.body['emailOrUsername'])

  if (!passLookup[0]) {
    res.send(403, 'Wrong username or password')
  }
  else if (bcrypt.compareSync(req.body['password'], passLookup[1].password)) {
    req.session.user = passLookup[1].userID
    res.redirect('/')
  } 
  else {
    return
  }
})

// Register
app.post('/register', (req, res) => {
  if (req.body['username'] === '' || 
        req.body['email'] === '' || 
        req.body['password'] == '' || 
        emailOrUserExists(req.body['email'], req.body['username'])[0]) {
    
    res.redirect(400, '/register')
    return
  }
  
  const user = createNewUser(req)
  req.session.user = user.userID

  res.redirect('/urls')
})

// ------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

// ------------------------------------------------------