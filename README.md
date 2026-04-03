# DevXtreme
1) Must-have features (no extra)
Citizen uploads pothole photo + auto GPS
AI detects pothole (bbox + confidence)
Auto severity (Low/Med/High)
Admin dashboard map + assign button
SLA timer + auto “OVERDUE” flag
Crew uploads after photo → mark fixed
That’s enough for a strong story: Detection + Accountability + Closure.

Fast stack (choose speed)
Frontend: Next.js (single web app with 2 views: Citizen + Admin)
Backend: FastAPI
DB: Supabase Postgres
Storage: Supabase bucket / Cloudinary
AI: YOLOv8 pretrained pothole model or Roboflow hosted inference
Map: Mapbox GL
Auth (optional): skip or simple role dropdown for demo
6–8 hour execution sprint
Hour 0–1
Create repo + schema
Hardcode 1 ward polygon
Setup upload endpoint
Hour 1–3
Build citizen form (photo, location, submit)
Store report + image URL in DB
Show reports on map
Hour 3–4
Integrate AI inference
Save detection result (confidence, bbox)
Severity = function(confidence + bbox area)
Hour 4–5
Admin table: Open/In Progress/Fixed
Assign issue to “Crew A/B”
Add SLA due time column
Hour 5–6
Cron job / endpoint to mark overdue
Red badge for overdue items
After photo upload + close ticket
Hour 6–7
Add KPI cards:
Open
Overdue
Avg closure time (mock if needed)
Polish UI
Hour 7–8
Practice demo + backup recorded video