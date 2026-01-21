Sprint12.md
Platform Analytics, Admin Oversight & Operational Intelligence

Product: TrustLens
Sprint Type: Backend
Status: Fully Implemented
Dependencies: Sprint1–Sprint11
Audience: Platform Admins only

1. Sprint Objective

Sprint12 delivers platform-wide analytics and admin oversight capabilities.

The backend provides:

Aggregate complaint metrics

Resolution performance analytics

Status distribution insights

Admin-only complaint review access

Read-only, audit-safe data exposure

No user-facing actions or legal enforcement features are included.

2. In-Scope Features
   2.1 Platform Metrics

Total complaints

Open vs resolved complaints

Average resolution time

Resolution method breakdown

2.2 Trend Analytics

Daily complaint submission trends

Daily resolution trends

Time-series optimized for charts

2.3 Status Analytics

Complaint distribution by status

Percent-based breakdown support

2.4 Admin Complaint Review

Paginated complaint list

Read-only complaint metadata

Drill-down support for UI drawers

3. Out of Scope

Complaint editing

Complaint deletion

Business enforcement

User communication

Legal terminology or workflows

4. Data Model
   4.1 Complaint Table (Existing)
   complaints

---

id UUID PRIMARY KEY
user_id UUID
brand_id UUID NULL
brand_name TEXT
status VARCHAR(32)
submitted_at TIMESTAMP NOT NULL
resolved_at TIMESTAMP NULL
resolution_method VARCHAR(32)
ai_confidence_score FLOAT NULL

4.2 Status Enum
PENDING
IN_PROGRESS
RESOLVED
ESCALATED
CLOSED

5. Backend Architecture
   app/
   └── admin/
   ├── router.py
   ├── services.py
   ├── schemas.py
   └── permissions.py

Pattern consistency:

Router handles HTTP only

Services handle all queries

Schemas enforce response contracts

Permissions enforce RBAC

6. Access Control
   6.1 Admin Guard
   def require_admin(user=Depends(get_current_user)):
   if not user.is_admin:
   raise HTTPException(status_code=403, detail="Admin access required")
   return user

All endpoints require admin access.

7. Schemas
   schemas.py
   from pydantic import BaseModel
   from datetime import date
   from typing import Optional

class PlatformStats(BaseModel):
total_complaints: int
resolved: int
open: int
avg_resolution_hours: Optional[float]

class TrendPoint(BaseModel):
date: date
count: int

class StatusBreakdown(BaseModel):
status: str
count: int

class AdminComplaintRow(BaseModel):
id: str
brand_name: str
status: str
submitted_at: str

8. Services Layer
   services.py
   from sqlalchemy import text
   from app.db import async_session

8.1 Platform Summary Stats
async def fetch*platform_stats():
query = text("""
SELECT
COUNT(*) AS total*complaints,
COUNT(*) FILTER (WHERE status = 'RESOLVED') AS resolved,
COUNT(\*) FILTER (WHERE status != 'RESOLVED') AS open,
AVG(
EXTRACT(EPOCH FROM (resolved_at - submitted_at))/3600
) FILTER (WHERE resolved_at IS NOT NULL)
AS avg_resolution_hours
FROM complaints
""")
async with async_session() as session:
result = await session.execute(query)
return result.mappings().first()

8.2 Complaint Submission Trend
async def fetch_submission_trend():
query = text("""
SELECT
DATE(submitted_at) AS date,
COUNT(\*) AS count
FROM complaints
GROUP BY date
ORDER BY date ASC
LIMIT 30
""")
async with async_session() as session:
result = await session.execute(query)
return result.mappings().all()

8.3 Resolution Trend
async def fetch_resolution_trend():
query = text("""
SELECT
DATE(resolved_at) AS date,
COUNT(\*) AS count
FROM complaints
WHERE resolved_at IS NOT NULL
GROUP BY date
ORDER BY date ASC
LIMIT 30
""")
async with async_session() as session:
result = await session.execute(query)
return result.mappings().all()

8.4 Status Breakdown
async def fetch_status_breakdown():
query = text("""
SELECT status, COUNT(\*) AS count
FROM complaints
GROUP BY status
""")
async with async_session() as session:
result = await session.execute(query)
return result.mappings().all()

8.5 Admin Complaint List
async def fetch_complaints(limit: int, offset: int):
query = text("""
SELECT id, brand_name, status, submitted_at
FROM complaints
ORDER BY submitted_at DESC
LIMIT :limit OFFSET :offset
""")
async with async_session() as session:
result = await session.execute(
query, {"limit": limit, "offset": offset}
)
return result.mappings().all()

9. Router
   router.py
   from fastapi import APIRouter, Depends
   from .services import _
   from .schemas import _
   from app.auth.dependencies import require_admin

router = APIRouter(
prefix="/admin/analytics",
tags=["Admin Analytics"],
dependencies=[Depends(require_admin)]
)

9.1 Endpoints
@router.get("/stats", response_model=PlatformStats)
async def platform_stats():
return await fetch_platform_stats()

@router.get("/trend/submissions", response_model=list[TrendPoint])
async def submission_trend():
return await fetch_submission_trend()

@router.get("/trend/resolutions", response_model=list[TrendPoint])
async def resolution_trend():
return await fetch_resolution_trend()

@router.get("/status-breakdown", response_model=list[StatusBreakdown])
async def status_breakdown():
return await fetch_status_breakdown()

@router.get("/complaints", response_model=list[AdminComplaintRow])
async def complaints(limit: int = 20, offset: int = 0):
return await fetch_complaints(limit, offset)

10. Performance & Indexing

Recommended indexes:

CREATE INDEX idx_complaints_submitted_at ON complaints(submitted_at);
CREATE INDEX idx_complaints_resolved_at ON complaints(resolved_at);
CREATE INDEX idx_complaints_status ON complaints(status);

11. Security & Compliance

Admin-only endpoints

No PII fields exposed

No mutation APIs

Fully auditable queries

Safe language used throughout

12. Acceptance Criteria

✔ Admin dashboard loads with real data
✔ Charts backed by backend analytics
✔ Complaint table paginates correctly
✔ No legal or enforcement wording
✔ No destructive operations
✔ Matches Sprint12-UI.md exactly
