const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const MapEditSchema = new Schema(
  {
    mapName: { type: String, required: true },
    geojson: { type: Object, required: true },
    ownedUser: { type: String, required: true },
    commentListPairs: { type: [Object], required: true },
    published: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MapEdit', MapEditSchema);
