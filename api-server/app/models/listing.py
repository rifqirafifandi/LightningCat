from app.extensions import db
from datetime import datetime

class Listing(db.Model):
  __tablename__ = 'listings'

  id = db.Column(db.Integer, primary_key=True)
  owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  facility_name = db.Column(db.Enum('facility_name'), nullable=False)
  activity = db.Column(db.Enum('activity_type'), nullable=False)
  start_time = db.Column(db.DateTime, nullable=False)
  end_time = db.Column(db.DateTime, nullable=False)
  capacity = db.Column(db.Integer, nullable=False)
  price = db.Column(db.Numeric(10, 2))
  status = db.Column(db.Enum('listing_status'), default='open')
  created_at = db.Column(db.DateTime, default=datetime.utcnow)

  # Relationship with User model
  owner = db.relationship('User', backref=db.backref('listings', lazy=True))

  def to_dict(self):
    return {
      'id': self.id,
      'owner_id': self.owner_id,
      'facility_name': self.facility_name,
      'activity': self.activity,
      'start_time': self.start_time.isoformat() if self.start_time else None,
      'end_time': self.end_time.isoformat() if self.end_time else None,
      'capacity': self.capacity,
      'price': float(self.price) if self.price else None,
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
  def create_listing(cls, user_id, facility_name, activity, start_time, end_time, 
                    capacity, price, status='open'):
    listing = cls(
      owner_id=user_id,
      facility_name=facility_name,
      activity=activity,
      start_time=start_time,
      end_time=end_time,
      capacity=capacity,
      price=price,
      status=status
    )

    db.session.add(listing)
    db.session.commit()
    return listing

  def __repr__(self):
    return f'<Listing {self.id}: {self.facility_name}>'
