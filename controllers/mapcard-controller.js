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
module.exports = {
  getAllCards,
};
