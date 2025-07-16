const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

let gfs;
let gridfsBucket;

const connectGridFS = (conn) => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
    bucketName: "uploads"
  });

  gfs = Grid(conn.connection.db, mongoose.mongo);
  gfs.collection("uploads");
};

const getGFS = () => gfs;
const getGridFSBucket = () => gridfsBucket;

module.exports = { connectGridFS, getGFS, getGridFSBucket };
