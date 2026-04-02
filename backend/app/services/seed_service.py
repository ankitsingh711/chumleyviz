from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.dashboard import Dashboard
from app.models.folder import Folder
from app.models.user import User


def ensure_seed_data(db: Session) -> None:
    settings = get_settings()

    if db.query(User).count() > 0:
        return

    demo_user = User(
        email=settings.demo_sso_email,
        full_name="Aspect BI Operator",
        password_hash=get_password_hash(settings.demo_sso_password),
    )
    db.add(demo_user)

    folders = [
        Folder(
            name="Executive Oversight",
            color="#5C4CFF",
            description="Leadership scorecards and real-time executive KPIs.",
        ),
        Folder(
            name="Revenue Engine",
            color="#00A6A6",
            description="Pipeline, bookings, and retention performance.",
        ),
        Folder(
            name="Operations Pulse",
            color="#FF7A59",
            description="Fulfillment, support, and service health dashboards.",
        ),
    ]
    db.add_all(folders)
    db.flush()

    dashboards = [
        Dashboard(
            title="Performance Analytics",
            description="Unified BI overview for daily business health and operating cadence.",
            owner="Revenue Strategy",
            category="Executive",
            preview_tone="violet",
            widget_count=4,
            folder_id=folders[0].id,
            widgets=[
                {"id": "bookings", "kind": "metric", "title": "Net New ARR", "value": "$4.8M", "delta": "+11.2%"},
                {"id": "coverage", "kind": "trend", "title": "Pipeline Coverage", "value": "3.4x", "series": [42, 46, 48, 52, 55, 58]},
                {"id": "regions", "kind": "bar", "title": "Regional Growth", "series": [28, 46, 35, 57, 44]},
                {
                    "id": "summary",
                    "kind": "note",
                    "title": "Executive Summary",
                    "body": "Bookings accelerated in the final two weeks while service SLAs remained within target range.",
                },
            ],
        ),
        Dashboard(
            title="Salesforce Funnel Health",
            description="Pipeline conversion, stage aging, and deal velocity across the commercial org.",
            owner="Revenue Operations",
            category="Sales",
            preview_tone="teal",
            widget_count=4,
            folder_id=folders[1].id,
            widgets=[
                {"id": "win-rate", "kind": "metric", "title": "Win Rate", "value": "31.4%", "delta": "+2.1 pts"},
                {"id": "velocity", "kind": "trend", "title": "Deal Velocity", "value": "42 days", "series": [60, 56, 52, 48, 44, 42]},
                {"id": "aging", "kind": "bar", "title": "Stage Aging", "series": [12, 19, 27, 31, 24]},
                {
                    "id": "table",
                    "kind": "table",
                    "title": "Top Segments",
                    "columns": ["Segment", "Coverage", "Win Rate"],
                    "rows": [["Enterprise", "3.8x", "34%"], ["Mid-Market", "3.1x", "29%"], ["SMB", "2.2x", "24%"]],
                },
            ],
        ),
        Dashboard(
            title="Customer Support Radar",
            description="Escalation volume, SLA adherence, and customer sentiment trends.",
            owner="Customer Success",
            category="Operations",
            preview_tone="orange",
            widget_count=4,
            folder_id=folders[2].id,
            widgets=[
                {"id": "sla", "kind": "metric", "title": "SLA Met", "value": "97.8%", "delta": "+0.9 pts"},
                {"id": "queue", "kind": "trend", "title": "Backlog", "value": "118", "series": [160, 154, 147, 139, 126, 118]},
                {"id": "severity", "kind": "bar", "title": "Ticket Severity Mix", "series": [10, 16, 30, 18, 8]},
                {
                    "id": "note",
                    "kind": "note",
                    "title": "Risk Callout",
                    "body": "Weekend staffing is the main constraint on first-response time for EMEA enterprise accounts.",
                },
            ],
        ),
        Dashboard(
            title="Marketing Attribution Stack",
            description="Campaign influence, sourced pipeline, and paid media return.",
            owner="Growth Marketing",
            category="Marketing",
            preview_tone="blue",
            widget_count=4,
            widgets=[
                {"id": "sourced", "kind": "metric", "title": "Sourced Pipeline", "value": "$2.1M", "delta": "+18.7%"},
                {"id": "efficiency", "kind": "trend", "title": "CAC Efficiency", "value": "1.7x", "series": [28, 35, 32, 40, 44, 49]},
                {"id": "channels", "kind": "bar", "title": "Channel Mix", "series": [22, 39, 51, 35, 26]},
                {
                    "id": "table",
                    "kind": "table",
                    "title": "Campaign Leaders",
                    "columns": ["Campaign", "Influence", "ROI"],
                    "rows": [["Field Summit", "$480k", "4.2x"], ["Paid Search", "$310k", "2.8x"], ["Partner Webinar", "$260k", "5.1x"]],
                },
            ],
        ),
        Dashboard(
            title="Finance Forecast Board",
            description="Plan versus actuals, spend pacing, and margin outlook.",
            owner="Finance",
            category="Finance",
            preview_tone="slate",
            widget_count=4,
            widgets=[
                {"id": "variance", "kind": "metric", "title": "Forecast Variance", "value": "-1.8%", "delta": "Stable"},
                {"id": "burn", "kind": "trend", "title": "Spend Pace", "value": "92%", "series": [72, 76, 80, 84, 89, 92]},
                {"id": "margin", "kind": "bar", "title": "Margin by Unit", "series": [42, 37, 48, 54, 46]},
                {
                    "id": "note",
                    "kind": "note",
                    "title": "Controller Note",
                    "body": "Vendor consolidation is improving margin performance, but hiring plans add pressure in Q3.",
                },
            ],
        ),
    ]
    db.add_all(dashboards)
    db.commit()
