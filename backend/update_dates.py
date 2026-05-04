from app import create_app
from database import db
from models import Company
import datetime

app = create_app()
with app.app_context():
    ongoing = Company.query.filter_by(status='ongoing').all()
    for c in ongoing:
        c.drive_date = '2026-05-01'
    
    upcoming = Company.query.filter_by(status='upcoming').all()
    start = datetime.date(2026, 5, 6)
    delta = datetime.timedelta(days=3)
    curr = start
    for c in upcoming:
        c.drive_date = curr.strftime('%Y-%m-%d')
        curr += delta
        if curr > datetime.date(2026, 6, 6):
            curr = datetime.date(2026, 6, 6)
    
    db.session.commit()
    print("Database dates updated successfully")
