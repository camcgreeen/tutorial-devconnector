const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // send a bad request response if input not valid
      // this is checked by express-validator
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password using bcrypt (salt and hash)
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      // BEFORE DEPLOYMENT, CHANGE EXPIRES IN TO 3600
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      // HTTP status code 500 means internal server error
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
