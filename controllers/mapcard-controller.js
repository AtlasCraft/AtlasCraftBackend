const auth = require('../auth');
const MapCard = require('../models/mapcard-model');

getAllCards = async (req, res) => {
  try {
    const maps = await MapCard.find({
      $or: [
        {
          ownedUser: req.username,
        },
        {
          published: true,
        },
      ],
    });
    return res
      .status(200)
      .json({
        success: true,
        maps: maps,
      })
      .send();
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
};

updateLikes = async (req, res) => {
  const mapId = req.params.id;
  try {
    const maps = await MapCard.findById(mapId);
    if (!maps) {
      return res.status(400).send();
    }
    maps.dislikedUser = maps.dislikedUsers.filter(
      (user) => user !== req.username
    );
    if (!maps.likedUsers.includes(req.username)) {
      maps.likedUsers.push(req.username);
    }
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
};

updateDislikes = async (req, res) => {
  const mapId = req.params.id;
  try {
    const maps = await MapCard.findById(mapId);
    if (!maps) {
      console.log('Map not Found');
      return res.status(400).send();
    }
    maps.likedUsers = maps.likedUsers.filter((user) => user !== req.username);
    if (!maps.dislikedUsers.includes(req.username)) {
      maps.dislikedUsers.push(req.username);
    }
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
};

module.exports = {
  getAllCards,
  updateLikes,
  updateDislikes,
};
