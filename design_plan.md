# Goals

- shorten links 
- redirect links
- track links

## Header:

if logged in:
  user's email
  show logout button

if not logged in:
  link to login page
  link to registration

## Behaviour

### GET /
if logged in:
  redirect to /urls
else:
  redirect to /login

### GET /urls
if logged in:
  shows:
    site header
    list of created URLs:
      short URL
      long URL
      edit                    /urls/:id
      delete                  /urls/:id/delete
      (stretches)
      date created
      # of visits
      # of unique visits
    link to create new        /urls/new
else:
  return 401

### GET /urls/new
if logged in:
  shows:
    site header
    form containing:
      text input for long URL
      submit button to POST to /urls
else:
  redirect to /login

### GET /urls/:id
if logged in:
  if owns URL ID:
    shows:
      site header
      short URL 
      form containing:
        long URL
        update button to POST to /urls/:id
      (stretches)
      date created
      # of visits
      # of unique visits
  if doesn't own URL ID:
    return error
  if ID doesn't exist:
    return error
else:
  return error

### GET /u/:id
if URL ID exists:
  redirect to long URL
else:
  return error

### POST /urls
if logged in:
  generate short URL, save, and associate with user
  redirect to /urls/:id
else:
  return error

### POST /urls/:id
if logged in:
  if owns URL ID:
    update URL
    redirect to /urls
  if doesn't own URL ID:
    return error
else:
  return error

### POST /urls/:id/delete
if logged in:
  if owns URL ID:
    delete URL
    redirect to /urls
  if doesn't own URL ID:
    return error
else:
  return error

### GET /login
if logged in:
  redirect to /urls
else:
  shows form:
    input fields for email and password
    submit button to POST to /login

### GET /register
if logged in:
  redirect to /urls
else: 
  shows form:
    input fields for email and password
    register button to POST to /register

### POST /login
if email and pass match existing user:
  set cookie
  redirect to /urls
else:
  return error

### POST /register
if email or pass is empty:
  return error
if email exists:
  return error
else:
  create user
  encrypt pass with bcrypt
  set cookie
  redirect to /urls

### POST /logout
  delete cookies
  redirect to /urls