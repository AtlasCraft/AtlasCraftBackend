const auth = require('../auth');
const express = require('express');
const UserController = require('../controllers/user-controller');
const MapEditController = require('../controllers/map-edit-controller');
const MapCardController = require('../controllers/mapcard-controller');
const router = express.Router();

router.post(
  '/mapeditinginfo',
  auth.verify,
  MapEditController.createMapEditingInfo
);
router.delete(
  '/mapeditinginfo/:id',
  auth.verify,
  MapEditController.deleteMapEditInfo
);
router.get(
  '/mapeditinginfo/:id',
  auth.verify,
  MapEditController.getMapEditInfoById
);
router.post(
  '/mapeditinginfo/:id',
  auth.verify,
  MapEditController.updateMapEditInfo
);

router.get('/mapcard', auth.verify, MapCardController.getAllCards);
router.post('/mapcard/:id/likes', auth.verify, MapCardController.updateLikes);
router.post(
  '/mapcard/:id/dislikes',
  auth.verify,
  MapCardController.updateDislikes
);

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/loggedIn', UserController.getLoggedIn);
router.get('/logout', UserController.logoutUser);
router.get('/sq/:username', UserController.retrieveSecurityQuestions);
router.post('/forgotPassword', UserController.forgotPassword);
router.post('/changePassword', auth.verify, UserController.changePassword);
router.post('/updateComment/:id', MapEditController.updateComment);

module.exports = router;
