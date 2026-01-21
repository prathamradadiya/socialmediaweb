const SocketIds = require("../../models/socketIds.model"); // model to store user_id + socket_id

async function addSocketId(userId, socketId) {
  await SocketIds.create({ userId, socketId });
}

async function removeSocketId(socketId) {
  await SocketIds.deleteOne({ socketId });
}

async function getSocketIds(userId) {
  const data = await SocketIds.find({ userId });
  return data.map((d) => d.socketId);
}

module.exports = { addSocketId, removeSocketId, getSocketIds };
