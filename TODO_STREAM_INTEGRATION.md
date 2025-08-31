# AI Streaming URL Integration TODO

## Main Tasks
- [x] Modify CameraStream component to support img tag for streaming
- [x] Update getStreamUrl function in LiveCameraView to handle the AI streaming URL
- [x] Add logic to detect when to use img vs video/iframe for streaming
- [x] Update AIReport.tsx to use img tag for AI streaming URLs
- [x] Update LiveCameraView.tsx to use img tag for AI streaming URLs
- [ ] Test the streaming integration with the provided URL

## Information Gathered
- User's streaming URL: http://192.168.48.240:5000/stream?camId=68b31e8da06778fd7db024da
- Camera system supports httpUrl field for streaming
- CameraStream component currently uses video/iframe tags
- Need to add img tag support for MJPEG or similar streams

## Plan
1. Modify CameraStream.tsx to detect stream type and use appropriate tag
2. Update LiveCameraView.tsx getStreamUrl function to handle the AI stream
3. Add camera with the streaming URL using AddCameraDialog
4. Test the streaming functionality

## Dependent Files
- src/components/CameraStream.tsx (modify to support img tag)
- src/components/LiveCameraView.tsx (update getStreamUrl function)
- Add camera through UI with the streaming URL

## Followup Steps
- [ ] Test img tag streaming with the provided URL
- [ ] Verify stream displays correctly in the UI
- [ ] Test fallback behavior if img stream fails
- [ ] Ensure responsive design works with img streams
