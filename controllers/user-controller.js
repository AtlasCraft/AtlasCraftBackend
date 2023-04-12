const auth = require('../auth');
const User = require('../models/user-model');
const bcrypt = require('bcryptjs');
const { response } = require('express');

const saltRounds = 10;
getLoggedIn = async (req, res) => {
  auth.verify(req, res, async function () {
    try {
      const loggedInUser = await User.findOne({ _id: req.userId });
      return res.status(200).json({
        loggedIn: true,
        user: {
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          email: loggedInUser.email,
          username: loggedInUser.username,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send();
    }
  });
};

registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      passwordVerify,
      username,
      securityQuestion1,
      securityQuestion2,
      answer1,
      answer2,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !passwordVerify ||
      !username ||
      !answer1 ||
      !answer2 ||
      !securityQuestion1 ||
      !securityQuestion2
    ) {
      return res
        .status(400)
        .json({ errorMessage: 'Please enter all required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: 'Please enter a password of at least 8 characters.',
      });
    }
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: 'Please enter the same password twice.',
      });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: 'An account with this email address already exists.',
      });
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    const answer1Hash = await bcrypt.hash(answer1, salt);
    const answer2Hash = await bcrypt.hash(answer2, salt);
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      securityQuestion1,
      securityQuestion2,
      answer1: answer1Hash,
      answer2: answer2Hash,
    });
    const savedUser = await newUser.save();

    // LOGIN THE USER
    // const token = auth.signToken(savedUser);

    await res
      // .cookie("token", token, {
      // 	httpOnly: true,
      // 	secure: true,
      // 	sameSite: "none",
      // })
      .status(200)
      .json({
        success: true,
        user: {
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          username: savedUser.username,
        },
      })
      .send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ errorMessage: 'Please enter all required fields.' });
    }
    // Try to find User
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ errorMessage: 'Invalid Credentials' });
    }
    // Compare password hashes
    const match = await bcrypt.compare(password, user.passwordHash);
    // Auth Failed
    if (!match) {
      return res.status(400).json({ errorMessage: 'Invalid Credentials' });
    } else {
      const token = auth.signToken(user);
      await res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        })
        .status(200)
        .json({
          success: true,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
          },
        })
        .send();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};

// Retrieve Security Questions
retrieveSecurityQuestions = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    res.status(200).json({
      success: true,
      securityQuestion1: user.securityQuestion1,
      securityQuestion2: user.securityQuestion2,
    });
  } catch (err) {
    res.status(500).send();
  }
};

// Forgot Password
forgotPassword = async (req, res) => {
  try {
    const { username, newPassword, newPasswordConfirm, answer1, answer2 } =
      req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ errorMessage: 'Invalid Credentials' });
    }
    answer1Verification = await bcrypt.compare(answer1, user.answer1);
    answer2Verification = await bcrypt.compare(answer2, user.answer2);
    if (answer1Verification && answer2Verification) {
      const salt = await bcrypt.genSalt(saltRounds);

      const passwordHash = await bcrypt.hash(newPassword, salt);
      user.passwordHash = passwordHash;
      await user.save();
      return res.status(200).json({ status: 'success' }).send();
    } else {
      return res.status(400).json({ errorMessage: 'Invalid Credentials' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};
// Change Passsword
changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;
    const user = await User.findOne({ username: req.username });
    if (newPassword !== newPasswordConfirm) {
      return res
        .status(400)
        .json({ errorMessage: 'Please enter the same password twice' });
    }
    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ errorMessage: 'Invalid Credentials' });
    } else {
      const salt = await bcrypt.genSalt(saltRounds);

      const passwordHash = await bcrypt.hash(newPassword, salt);
      user.passwordHash = passwordHash;
      await user.save();
      return res.status(200).json({ status: 'success' }).send();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};

logoutUser = async (req, res) => {
  return res.clearCookie('token').status(200).json({
    success: true,
    message: 'Successfully Logged out',
  });
};
module.exports = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  retrieveSecurityQuestions,
  changePassword,
  forgotPassword,
};
