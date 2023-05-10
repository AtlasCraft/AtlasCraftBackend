const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const MapCardSchema = new Schema(
  {
    mapId: { type: String, required: true },
    mapName: { type: String, required: true },
    thumbail: { type: BSON },
    ownedUser: { type: String, required: true },
    published: { type: Boolean, required: true },
    likedUsers: { type: [String], required: true },
    dislikedUsers: { type: [String], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MapCard', MapCardSchema);
