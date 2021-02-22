const jwt = require('jsonwebtoken');
const config = require('config');

/*
  We are exporting a middleware function 
  that has access to the req and res objects.
  We are getting the token from the header.
  If no token, and trying to access a protected route,
  return a 401 authorisation denied status code.
  If there is a token, but it's not valid, error not valid.
  If the token is valid, decode it through verify method from jsonwebtoken package
  and then set the request user equal to the user in the decoded object.
  Now we can use that user in protected routes by adding auth to the get() request.
*/
module.exports = function (req, res, next) {
  // get token from header
  const token = req.header('x-auth-token');

  // check if no token
  if (!token) {
    // 401 Not Authorised
    return res.status(401).json({ msg: 'No token, authorisation denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
