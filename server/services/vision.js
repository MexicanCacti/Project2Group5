const serviceAccount = require("./serviceAccount.json");

const vision = require("@google-cloud/vision");

async function getLabels(image) {

  // Creates a client
  const client = new vision.ImageAnnotatorClient();
  // Performs label detection on the image file
  const [result] = await client.labelDetection(image);
  const labels = result.labelAnnotations;
  return labels.map(label => label.description);
}

module.exports = {getLabels}