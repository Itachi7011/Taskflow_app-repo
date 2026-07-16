// utils/textOperations.js
//
// this is a plain JS copy of worker/operations.py's four operations.
// its ONLY used by the in-process fallback in queues/taskQueue.js, for
// when redis isnt available and theres no python worker to hand the job
// to. the "real"/intended path is still redis + the python worker - this
// is just a bypass so the app keeps working end to end without either
// of those running. if you ever add a new operation, add it in both
// places.

const runOperation = (operationType, text) => {
  switch (operationType) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "reverse":
      return text.split("").reverse().join("");
    case "word_count":
      // same whitespace-aware splitting as the python version - filter
      // out empty strings so multiple spaces/newlines dont get counted
      return String(text.split(/\s+/).filter(Boolean).length);
    default:
      throw new Error(`Unknown operation type: ${operationType}`);
  }
};

module.exports = { runOperation };