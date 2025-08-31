# TODO for AIReport Backend Data Integration

## Tasks

- [ ] Update `renderRealtimeData` in `src/pages/AIReport.tsx`:
  - Replace mock realtime data with data fetched from backend using `getState` API.
  - Fetch data based on selected camera and current date/time.
  - Display fetched realtime data in the UI.

- [ ] Update `handleComparisonSubmit` in `src/pages/AIReport.tsx`:
  - Replace hardcoded comparison data with data fetched from backend.
  - Use `getAIReports` or `getState` API to fetch data for the selected date/time ranges.
  - Parse and set the fetched data into `comparison1Data` and `comparison2Data` states.

- [ ] Use existing Redux Toolkit Query hooks (`useGetStateQuery`, `useGetAIReportsQuery`) or create new hooks if necessary.

- [ ] Ensure proper data transformation to match `ComparisonData` interface.

- [ ] Test the changes to verify realtime and comparison data are correctly fetched and displayed from backend.

## Followup

- After completing the above, verify UI updates and data correctness.
- Address any errors or edge cases in data fetching or rendering.
