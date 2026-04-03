import { runInference } from '../services/inferenceService.js';

export const testInference = async (req, res) => {
  try {
    const { image_url } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: "image_url is required required to run inference." });
    }

    const { confidence, bbox, severity } = await runInference(image_url);
    
    res.json({
      success: true,
      data: {
        confidence,
        bbox,
        severity
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
