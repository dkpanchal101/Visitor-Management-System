const faceapi = require("face-api.js");
const { Canvas, Image, ImageData, loadImage, createCanvas } = require("@napi-rs/canvas");
const path = require("path");

require("@tensorflow/tfjs");

// face-api.js expects node-canvas behaviour: `new Canvas()` then set .width/.height,
// and Image.naturalWidth / naturalHeight / complete — @napi-rs/canvas differs.
faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData,
  createCanvasElement: () => createCanvas(1, 1),
});

/** Load image with browser-like fields that face-api.js requires */
async function loadImageForFace(src) {
  const img = await loadImage(src);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  if (!img.naturalWidth) {
    Object.defineProperty(img, "naturalWidth", { value: w, configurable: true });
  }
  if (!img.naturalHeight) {
    Object.defineProperty(img, "naturalHeight", { value: h, configurable: true });
  }
  if (!img.complete) {
    Object.defineProperty(img, "complete", { value: true, configurable: true });
  }

  return img;
}

async function loadModels() {
  const modelPath = path.join(__dirname, "../models");
  console.log("Loading AI models from:", modelPath);

  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    console.log("AI models loaded successfully");
  } catch (error) {
    console.error("Failed to load models. Check the models folder exists.", error);
    throw error;
  }
}

async function getFaceDescriptor(imagePath) {
  try {
    const fullPath = path.resolve(imagePath);
    const img = await loadImageForFace(fullPath);

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.log("No face detected in image");
      return null;
    }

    return {
      descriptor: detection.descriptor,
      box: detection.detection.box,
    };
  } catch (error) {
    console.error("Face detection error:", error.message);
    return null;
  }
}

function euclideanDistance(d1, d2) {
  return Math.sqrt(d1.reduce((sum, val, i) => sum + (val - d2[i]) ** 2, 0));
}

module.exports = {
  loadModels,
  getFaceDescriptor,
  euclideanDistance,
};
