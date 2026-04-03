# Inference Test Data

This folder serves as the central hub for the **AI/ML Lead** to track model accuracies and provide benchmark URLs for testing the Roboflow pipeline.

## Expected Outputs

Refer to `expected_outputs.json` for a catalog of public images showcasing different severity profiles.

## Testing the Model
If the backend is running locally, use the following `curl` command to verify exactly what the AI returns for a specific image without opening a full Ticket Issue:

```bash
curl -X POST http://localhost:5000/infer \
-H "Content-Type: application/json" \
-d '{"image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Potholes_in_a_dirt_road.jpg/800px-Potholes_in_a_dirt_road.jpg"}'
```

The severity label (`Low`, `Medium`, `High`) is evaluated locally within `backend/services/inferenceService.js` based on the bounding box parameters.
