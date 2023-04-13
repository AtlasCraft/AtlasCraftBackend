const MapEditInfo = require('../models/map-edit-model');
const MapCard = require('../models/mapcard-model');

createMapEditingInfo = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide data',
    });
  }
  try {
    let map = new MapEditInfo({
      mapName: body.mapName,
      geojson: body.geojson,
      ownedUser: req.username,
      commentListPairs: [],
      published: false,
    });
    map = await map.save();

    const mapcard = new MapCard({
      mapId: map._id,
      mapName: req.body.mapName,
      ownedUser: req.username,
      published: false,
    });
    await mapcard.save();
    res.status(200).json({
      success: true,
      map: map,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, err }).send();
  }
};

deleteMapEditInfo = async (req, res) => {
  const mapId = req.params.id;
  try {
    const map = await MapEditInfo.findById(mapId);
    if (!map || map.ownedUser !== req.username) {
      return res
        .status(400)
        .json({ success: false, message: 'Map not found' })
        .send();
    }
    await MapEditInfo.findOneAndDelete({ _id: mapId });
    await MapCard.findOneAndDelete({ mapId });
    return res.status(200).json({ success: true }).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

getMapEditInfoById = async (req, res) => {
  const mapId = req.params.id;
  try {
    const map = await MapEditInfo.findById(mapId);
    if (!map || map.ownedUser !== req.username) {
      return res
        .status(400)
        .json({ success: false, message: 'Map not found' })
        .send();
    }
    return res
      .status(200)
      .json({
        success: true,
        map: map,
      })
      .send();
  } catch (err) {
    return res.status(400).send();
  }
};
updateMapEditInfo = async (req, res) => {
  const mapId = req.params.id;
  const { mapName, geojson, published } = req.body;
  try {
    const map = await MapEditInfo.findById(mapId);
    if (!map || map.ownedUser !== req.username) {
      return res
        .status(400)
        .json({ success: false, message: 'Map not found' })
        .send();
    }
    map.mapName = mapName;
    map.geojson = geojson;
    if (published) {
      map.published = published;
    }
    await map.save();
    const mapcard = await MapCard.findOne({ mapId });
    mapcard.mapName = mapName;
    if (published) {
      mapcard.published = published;
    }
    await mapcard.save();
    return res.status(200).json({ success: true }).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

module.exports = {
  createMapEditingInfo,
  deleteMapEditInfo,
  getMapEditInfoById,
  updateMapEditInfo,
};
