Sprint 25 Backend. AI Fake Responder Detection & Business Authenticity Scoring

1. Database Models
   models/responder_authenticity.py
   from sqlalchemy import (
   String,
   Integer,
   Float,
   Boolean,
   ForeignKey,
   DateTime,
   JSON,
   Index,
   )
   from sqlalchemy.orm import Mapped, mapped_column
   from sqlalchemy.sql import func
   from app.db.base import Base

class ResponderAuthenticityScore(Base):
**tablename** = "responder_authenticity_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    response_id: Mapped[int] = mapped_column(ForeignKey("responses.id"), index=True)
    business_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    identity_score: Mapped[float] = mapped_column(Float, nullable=False)
    behavior_score: Mapped[float] = mapped_column(Float, nullable=False)
    language_score: Mapped[float] = mapped_column(Float, nullable=False)
    reputation_score: Mapped[float] = mapped_column(Float, nullable=False)

    composite_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_band: Mapped[str] = mapped_column(String(20), nullable=False)

    rule_breakdown: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("idx_ras_response", "response_id"),
        Index("idx_ras_risk_band", "risk_band"),
    )

2. Risk Evaluation Engine
   services/responder_risk_engine.py
   import math
   from app.services.text_similarity import semantic_similarity
   from app.services.domain_utils import extract_domain
   from app.services.reputation import get_business_reputation_score

class ResponderRiskEngine:
def **init**(self, business, response, historical_responses):
self.business = business
self.response = response
self.historical_responses = historical_responses

    def identity_consistency(self) -> tuple[float, dict]:
        email_domain = extract_domain(self.business.email)
        official_domains = self.business.verified_domains or []

        domain_match = email_domain in official_domains
        score = 0.0 if domain_match else 1.0

        return score, {
            "email_domain": email_domain,
            "official_domains": official_domains,
            "domain_match": domain_match,
        }

    def behavior_analysis(self) -> tuple[float, dict]:
        volume = len(self.historical_responses)
        avg_length = sum(len(r.body) for r in self.historical_responses) / max(volume, 1)

        velocity_score = min(volume / 10, 1.0)
        templated_score = semantic_similarity(self.response.body, self.historical_responses)

        combined = min((velocity_score + templated_score) / 2, 1.0)

        return combined, {
            "response_volume": volume,
            "avg_length": avg_length,
            "velocity_score": velocity_score,
            "templated_score": templated_score,
        }

    def language_intent(self) -> tuple[float, dict]:
        flags = {
            "threats": "legal action" in self.response.body.lower(),
            "off_platform": "email me directly" in self.response.body.lower(),
            "blame_shift": "your fault" in self.response.body.lower(),
        }

        score = sum(flags.values()) / len(flags)

        return score, flags

    def reputation(self) -> tuple[float, dict]:
        reputation = get_business_reputation_score(self.business.id)
        score = 1.0 - reputation

        return score, {"historical_reputation": reputation}

    def calculate(self):
        identity, i_meta = self.identity_consistency()
        behavior, b_meta = self.behavior_analysis()
        language, l_meta = self.language_intent()
        reputation, r_meta = self.reputation()

        composite = (
            identity * 0.30
            + behavior * 0.25
            + language * 0.25
            + reputation * 0.20
        )

        composite = round(composite * 100, 2)

        if composite >= 70:
            band = "HIGH"
        elif composite >= 40:
            band = "MEDIUM"
        else:
            band = "LOW"

        return {
            "identity_score": identity,
            "behavior_score": behavior,
            "language_score": language,
            "reputation_score": reputation,
            "composite_score": composite,
            "risk_band": band,
            "rule_breakdown": {
                "identity": i_meta,
                "behavior": b_meta,
                "language": l_meta,
                "reputation": r_meta,
            },
        }

3. Persistence Layer
   repositories/authenticity_repository.py
   from sqlalchemy.ext.asyncio import AsyncSession
   from sqlalchemy import select
   from app.models.responder_authenticity import ResponderAuthenticityScore

class AuthenticityRepository:
def **init**(self, db: AsyncSession):
self.db = db

    async def create(self, payload: dict):
        entity = ResponderAuthenticityScore(**payload)
        self.db.add(entity)
        await self.db.commit()
        await self.db.refresh(entity)
        return entity

    async def by_response(self, response_id: int):
        result = await self.db.execute(
            select(ResponderAuthenticityScore).where(
                ResponderAuthenticityScore.response_id == response_id
            )
        )
        return result.scalar_one_or_none()

4. Service Layer
   services/authenticity_service.py
   from app.services.responder_risk_engine import ResponderRiskEngine
   from app.repositories.authenticity_repository import AuthenticityRepository

class AuthenticityService:
def **init**(self, db):
self.repo = AuthenticityRepository(db)

    async def evaluate(self, business, response, history):
        engine = ResponderRiskEngine(business, response, history)
        score_payload = engine.calculate()

        score_payload.update({
            "response_id": response.id,
            "business_user_id": business.id,
        })

        return await self.repo.create(score_payload)

5. Response Publishing Hook
   services/response_pipeline.py
   from app.services.authenticity_service import AuthenticityService

async def process_business_response(db, business, response, historical_responses):
authenticity_service = AuthenticityService(db)
authenticity = await authenticity_service.evaluate(
business, response, historical_responses
)

    if authenticity.risk_band == "HIGH":
        response.flags.append("UNDER_AUTHENTICITY_REVIEW")
    elif authenticity.risk_band == "MEDIUM":
        response.flags.append("UNVERIFIED_RESPONDER")

    db.add(response)
    await db.commit()

    return response

6.  Public Label Resolver
    services/response_labels.py
    def resolve_public_label(auth_score):
    if auth_score.risk_band == "HIGH":
    return {
    "label": "Response under authenticity review",
    "severity": "warning",
    }

        if auth_score.risk_band == "MEDIUM":
            return {
                "label": "Response from an unverified business account",
                "severity": "info",
            }

        return None

7.  Admin Review API
    api/admin/authenticity.py
    from fastapi import APIRouter, Depends
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.db.session import get_db
    from app.models.responder_authenticity import ResponderAuthenticityScore
    from sqlalchemy import select

router = APIRouter(prefix="/admin/authenticity", tags=["Admin Authenticity"])

@router.get("/queue")
async def review*queue(db: AsyncSession = Depends(get_db)):
result = await db.execute(
select(ResponderAuthenticityScore).where(
ResponderAuthenticityScore.risk_band.in*(["HIGH", "MEDIUM"])
)
)
return result.scalars().all()

8. Verification Interaction Logic
   services/verification_effects.py
   def adjust_score_for_verification(score: float, is_verified: bool) -> float:
   if is_verified:
   return max(score - 15, 0)
   return score

9. Audit Logging
   models/authenticity_audit.py
   from sqlalchemy import Integer, String, DateTime, ForeignKey
   from sqlalchemy.orm import mapped_column, Mapped
   from sqlalchemy.sql import func
   from app.db.base import Base

class AuthenticityAuditLog(Base):
**tablename** = "authenticity_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    authenticity_score_id: Mapped[int] = mapped_column(
        ForeignKey("responder_authenticity_scores.id")
    )
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(50))
    reason: Mapped[str] = mapped_column(String(255))

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

10. What Sprint 25 Achieves Strategically

No forced payment to respond

Fake responders detected and surfaced transparently

Verification becomes a trust amplifier, not a gate

Admin decisions are explainable and auditable

Fully compatible with Sprint 21–24 verification revenue model
