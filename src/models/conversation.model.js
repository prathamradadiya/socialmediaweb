const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      enum: [group, private],
      required: true,
    },
    conversation_mem_id: [
      {
        type: String,
        required: true,
      },
    ],
    last_mess_Id: {
      type: String,
      required: true,
    },
    deleted_at: {
      type: string,
    },
  },
  { timestamps: true }
);
const conversation = mongoose.model("conversations", conversationSchema);
module.exports = conversation;
