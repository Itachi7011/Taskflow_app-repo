// models/Task.js
const mongoose = require("mongoose");

// these are the only 4 operations the python worker knows how to do,
// keeping this enum in sync with worker/operations.py is important
const OPERATION_TYPES = ["uppercase", "lowercase", "reverse", "word_count"];
const STATUS_TYPES = ["pending", "running", "success", "failed"];

const TaskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: `${process.env.APP_NAME}_User`,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    inputText: {
      type: String,
      required: true,
      maxlength: 20000, // gotta cap this somewhere, dont want someone dumping a whole novel
    },

    operationType: {
      type: String,
      enum: OPERATION_TYPES,
      required: true,
    },

    status: {
      type: String,
      enum: STATUS_TYPES,
      default: "pending",
      index: true,
    },

    result: {
      type: String,
      default: null,
    },

    // simple array of log lines, worker keeps pushing to this as it goes
    logs: {
      type: [String],
      default: [],
    },

    errorMessage: {
      type: String,
      default: null,
    },

    startedAt: Date,
    finishedAt: Date,
  },
  { timestamps: true },
);

// most common query is going to be "give me this users tasks, newest first"
TaskSchema.index({ owner: 1, createdAt: -1 });

// pinning the collection name explicitly (instead of letting mongoose
// auto pluralize the model name) because the python worker connects to
// this same collection directly with pymongo, so both sides need to
// agree on the exact name rather than one of us guessing mongoose's
// pluralization rules
const COLLECTION_NAME = `${process.env.APP_NAME}_tasks`.toLowerCase();

module.exports = mongoose.model(`${process.env.APP_NAME}_Task`, TaskSchema, COLLECTION_NAME);
module.exports.OPERATION_TYPES = OPERATION_TYPES;
module.exports.STATUS_TYPES = STATUS_TYPES;
