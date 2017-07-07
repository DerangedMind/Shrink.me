const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const cookieSession = require('cookie-session')
const methodOverride = require('method-override')
const app = express()
const PORT = process.env.PORT || 8080 // default port 8080

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
app.use(cookieSession( {
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 24 * 60 * 60 * 1000
}))

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Wanted to place URL key:values into the users object,
// but this would then require the tinyURL link to search 
// each user. urlDatabase is only created so that we can
// easily lookup the key:value pair

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    visitors: { },
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    visitors: { }
  }
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
  urlDatabase[shortURL] = { }
  urlDatabase[shortURL].longURL = longURL
  urlDatabase[shortURL].visitors = { }

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

function emailOrUserExists(email, username = email) {

  for (let userID in users) {
    if (users[userID].email === email || users[userID].username === username) {
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

function getTimestamp() {
  let time = ''
  let date = new Date()
  let year = date.getFullYear().toString() 
  let month = addZerosForTime((date.getMonth() + 1).toString())
  let day = addZerosForTime(date.getDate().toString() )
  let hour = addZerosForTime(date.getUTCHours().toString())
  let minute = addZerosForTime(date.getUTCMinutes().toString())
  let seconds = addZerosForTime(date.getUTCSeconds().toString())

  time = `${year}/${month}/${day} ${hour}:${minute}:${seconds}`

  return time
}

function addZerosForTime(string) {
  while (string.length < 2) {
    string = "0" + string
  }
  return string
}

// GET for Redirect URLs ----------------------------------

app.get('/', (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }
  res.redirect('/urls')
})

app.get('/u/:shortURL', (req, res) => {
  if (req.session.user === undefined && req.session.visitor === undefined) {
    req.session.visitor = generateRandomString()
  }
  let shortURL = req.params.shortURL
  let visitor = req.session.user || req.session.visitor

  if (urlDatabase[shortURL].visitors[visitor] === undefined) {
    urlDatabase[shortURL].visitors[visitor] = { }
    urlDatabase[shortURL].visitors[visitor].ID = visitor
    urlDatabase[shortURL].visitors[visitor].timestamps = []
  }

  urlDatabase[shortURL].visitors[visitor].timestamps.push(getTimestamp())

  res.redirect(`${urlDatabase[req.params.shortURL].longURL}`)
})

// GET for User URL pages ----------------------------------

app.get('/urls', (req, res) => {
  if (req.session.user === undefined) {
    res.redirect('/login')
    return
  }

  res.render('pages/urls_index', {
    userURLs: users[req.session.user].urls,
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
  if (users[req.session.user].urls[req.params.id] !== urlDatabase[req.params.id].longURL) {
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

// Edit URL
app.put('/urls/:id', (req, res) => {
  if (users[req.session.user].urls[req.params.id] !== urlDatabase[req.params.id].longURL) {
    res.redirect(403, '/urls')
    return
  }
  
  delete users[req.session.user].urls[req.params.id]
  const shortURL = createNewURL(req)

  res.redirect(`/urls/${shortURL}`)
})

// Delete URL
app.delete('/urls/:id/delete', (req, res) => {
  if (users[req.session.user].urls[req.params.id] !== urlDatabase[req.params.id].longURL) {
    res.redirect(403, '/urls')
    return
  }
  
  delete users[req.session.user].urls[req.params.id]
  delete urlDatabase[req.params.id]
  
  res.redirect('/urls')
})


// Account Login/Signup ----------------------------------------

// Login
app.post('/login', (req, res) => {
  
  const userLookup = emailOrUserExists(req.body['emailOrUsername'])

  if (!userLookup[0]) {
    res.send(403, 'Wrong username or password')
  }
  else if (bcrypt.compareSync(req.body['password'], userLookup[1].password)) {
    req.session.user = userLookup[1].userID
    res.redirect('/')
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