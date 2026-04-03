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


Member 1 — Frontend Lead (Citizen + Admin UI)
Owns:

Citizen report form (photo upload + GPS)
Admin dashboard (table + filters + status chips)
Map view with issue pins (Mapbox)
KPI cards (Open, Overdue, Fixed)
Deliverables:

/report page
/admin page
/map component
clean demo-ready UI
Member 2 — Backend + Database Lead
Owns:

FastAPI endpoints
Postgres schema + migrations
Issue lifecycle logic (Open → Assigned → In Progress → Fixed)
SLA due-time + overdue flag logic
Deliverables:

Working REST APIs
DB tables wired
status update + assignment APIs
cron/endpoint for overdue update
Member 3 — AI/ML + Inference Lead
Owns:

YOLO/Roboflow pothole detection integration
detection output parser (bbox/confidence)
severity scoring service
fallback mock model (if inference fails)
Deliverables:

/infer pipeline
confidence + bbox stored
severity label (Low/Medium/High)
sample test images with expected output
Member 4 — Ops/Workflow + Pitch Lead
Owns:

SLA escalation logic + rules
demo data seeding (15–20 reports)
storyboard + pitch deck + speaking flow
final demo orchestration + backup video
Deliverables:

escalation matrix in app/slide
seeded realistic dataset
6-slide pitch deck
final 90-sec demo script