from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import ENUM

FACILITY_NAMES = ['Queenstown Sports Centre', 'Choa Chu Kang Sports Centre', 'Yishun Swimming Complex', 'Jurong West Sports Centre', 'Jalan Besar Sports Centre', 'Bedok Stadium', 'Burghley Squash and Tennis Centre', 'Toa Payoh Sports Centre', 'Sengkang Sports Centre', 'Geylang Field', 'Heartbeat@Bedok', 'Katong Swimming Complex', 'Bukit Gombak Sports Centre', 'Enabling Village Gym', 'Serangoon Sports Centre', 'Woodlands Sports Centre', 'Jurong Stadium', 'Yio Chu Kang Sports Centre', 'Kallang Sports Centre', 'Kallang Basin Swimming Complex', 'Clementi Sports Centre', 'Jurong East Sports Centre', 'Delta Sports Centre', 'Geylang East Swimming Complex', 'Pasir Ris Sports Centre', 'AMK Swimming Complex', 'Bishan Sports Centre', 'Farrer Park Field and Tennis Centre', 'Co Curricular Activities Branch', 'Hougang Sports Centre', 'Bukit Batok Swimming Complex', 'St Wilfrid Sports Centre', 'Clementi Stadium', 'Our Tampines Hub - Community Auditorium', 'Yishun Sports Centre']
ACTIVITY_TYPES = ['Football', 'Badminton', 'Athletics', 'Table_tennis', 'Hockey', 'Volleyball', 'Soccer', 'Petanque', 'Basketball', 'Swimming', 'Pickleball', 'Lawn_bowl', 'Gym', 'Tennis', 'Indoor', 'Gateball', 'Wading', 'Netball', 'Squash', 'Rugby']
LISTING_STATUS = ['open', 'full', 'cancelled', 'completed']

class Listing(db.Model):
  __tablename__ = 'listings'

  id = db.Column(db.Integer, primary_key=True)
  owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  activity = db.Column(ENUM(*ACTIVITY_TYPES, name='activity_type', create_type=False), nullable=False)
  facility_name = db.Column(ENUM(*FACILITY_NAMES, name='facility_name', create_type=False), nullable=False)
  venue = db.Column(db.String(255), nullable=False)
  date = db.Column(db.Date, nullable=False)
  duration = db.Column(db.Integer, nullable=False)
  capacity = db.Column(db.Integer, nullable=False)
  fee = db.Column(db.Integer, nullable=False)
  status = db.Column(ENUM(*LISTING_STATUS, name='listing_status', create_type=False), default='open')
  created_at = db.Column(db.DateTime, default=datetime.utcnow)

  # Relationship with User model
  owner = db.relationship('User', backref=db.backref('listings', lazy=True))

  def to_dict(self):
    return {
      'id': self.id,
      'owner_id': self.owner_id,
      'activity': self.activity,
      'facility_name': self.facility_name,
      'venue': self.venue,  # This was missing
      'date': self.date.isoformat() if self.date else None,
      'duration': self.duration,
      'capacity': self.capacity,
      'fee': self.fee,
      'status': self.status,
      'created_at': self.created_at.isoformat() if self.created_at else None,
      'bookings_count': len(self.bookings) if hasattr(self, 'bookings') else 0
    }

  @classmethod
  def get_single_listing(cls, id):
    return cls.query.get(id)

  @classmethod
  def get_user_listings(cls, user_id):
    return cls.query.filter_by(owner_id=user_id).all()

  @classmethod
  def get_all_listings(cls):
    return cls.query.all()

  @classmethod
  def create_listing(cls, user_id, activity, facility_name, venue, date, duration, 
                    capacity, fee, status='open'):
    listing = cls(
      owner_id=user_id,
      activity=activity,
      facility_name=facility_name,
      venue=venue,
      date=datetime.fromisoformat(date) if isinstance(date, str) else date,
      duration=duration,
      capacity=capacity,
      fee=fee,
      status=status
    )

    db.session.add(listing)
    db.session.commit()
    return listing
  
  @classmethod
  def update_listing(cls, listing_id, status):
    listing = cls.query.get(listing_id)
    if not listing:
      return None

    setattr(listing, 'status', status)

    db.session.commit()
    return listing
  
  def __repr__(self):
    return f'<Listing {self.id}: {self.facility_name}>'
