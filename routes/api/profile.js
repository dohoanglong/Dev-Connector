const express = require('express');
const route = express.Router();
const auth = require('../../middlewares/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');

//@route    GET api/profile/me
//@desc     Get current users profiles
//@access   Private
route.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.send(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
route.post(
  '/',
  [
    auth,
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty(),
  ],
  (req, res) => {

  }
);

module.exports = route;
