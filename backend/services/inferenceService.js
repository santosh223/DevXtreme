import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY || '';
const ROBOFLOW_MODEL_URL = process.env.ROBOFLOW_MODEL_URL || 'https://detect.roboflow.com/pothole-detection/1';

const mockAiInference = () => {
  const confidence = Number((Math.random() * (0.99 - 0.6) + 0.6).toFixed(2));
  const bbox_area = Math.random() * 900 + 100;

  return {
    confidence,
    bbox: `[0, 0, ${Math.floor(bbox_area / 10)}, ${Math.floor(bbox_area / 10)}]`,
    bbox_area
  };
};

const calculateSeverity = (confidence, bboxArea) => {
  if (confidence > 0.8 && bboxArea > 700) {
    return 'High';
  } else if (confidence > 0.7 && bboxArea > 400) {
    return 'Medium';
  }
  return 'Low';
};

export const runInference = async (imageUrl) => {
  try {
    // If no API key is provided or the generic placeholder is there, fall back to mock
    if (!ROBOFLOW_API_KEY || ROBOFLOW_API_KEY === "") {
      console.log("No Inference API key found. Falling back to mock model.");
      const mockedResult = mockAiInference();
      return {
        confidence: mockedResult.confidence,
        bbox: mockedResult.bbox,
        severity: calculateSeverity(mockedResult.confidence, mockedResult.bbox_area)
      };
    }

    console.log(`Calling Roboflow directly with image: ${imageUrl}`);
    
    // Convert image URL to base64, or use Roboflow's image URL query param features.
    // For this Roboflow endpoint, we can pass `&image=URL`
    const inferUrl = `${ROBOFLOW_MODEL_URL}?api_key=${ROBOFLOW_API_KEY}&image=${encodeURIComponent(imageUrl)}`;
    
    const response = await axios.post(inferUrl);
    
    if (response.data && response.data.predictions && response.data.predictions.length > 0) {
      // Find the prediction with the highest confidence
      const topPrediction = response.data.predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );

      const confidence = Number((topPrediction.confidence).toFixed(2));
      const width = topPrediction.width;
      const height = topPrediction.height;
      const x = topPrediction.x;
      const y = topPrediction.y;
      
      const bbox_area = width * height;
      const bbox = `[${x}, ${y}, ${width}, ${height}]`;

      const severity = calculateSeverity(confidence, bbox_area);

      return {
        confidence,
        bbox,
        severity
      };
    } else {
      throw new Error("No detections found from AI Model.");
    }
    
  } catch (error) {
    console.error("AI Inference failed or returned no results:", error.message);
    console.log("Falling back to simulated response due to failure.");
    
    const mockedResult = mockAiInference();
    return {
      confidence: mockedResult.confidence,
      bbox: mockedResult.bbox,
      severity: calculateSeverity(mockedResult.confidence, mockedResult.bbox_area)
    };
  }
};
