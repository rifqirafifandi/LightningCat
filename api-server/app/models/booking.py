from app.extensions import db
from datetime import datetime

class Booking(db.Model):
  __tablename__ = 'bookings'

  id = db.Column(db.Integer, primary_key=True)
  listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  booking_status = db.Column(db.Enum('booking_status'), default='pending')
  payment_status = db.Column(db.Enum('payment_status'), default='unpaid')
  amount = db.Column(db.Numeric(10, 2))
  created_at = db.Column(db.DateTime, default=datetime.utcnow)

  # Relationships
  listing = db.relationship('Listing', backref=db.backref('bookings', lazy=True))
  user = db.relationship('User', backref=db.backref('bookings', lazy=True))

  # Unique constraint
  __table_args__ = (
    db.UniqueConstraint('listing_id', 'user_id', name='uq_booking_listing_user'),
  )

  def to_dict(self):
    return {
      'id': self.id,
      'listing_id': self.listing_id,
      'user_id': self.user_id,
      'booking_status': self.booking_status,
      'payment_status': self.payment_status,
      'amount': float(self.amount) if self.amount else None,
      'created_at': self.created_at.isoformat() if self.created_at else None,
      'listing': self.listing.to_dict() if self.listing else None,
      'user': self.user.to_dict() if hasattr(self.user, 'to_dict') else None
    }

  @classmethod
  def get_single_booking(cls, id):
    return cls.query.get(id)

  @classmethod
  def get_user_bookings(cls, user_id):
    return cls.query.filter_by(user_id=user_id).all()

  @classmethod
  def get_all_bookings(cls):
    return cls.query.all()

  @classmethod
  def create_booking(cls, user_id, listing_id, amount=None, 
                    booking_status='pending', payment_status='unpaid'):
    listing = Listing.query.get(listing_id)
    if not listing:
      return None

    # If amount not provided, use listing price
    if amount is None and listing.price:
      amount = listing.price

    booking = cls(
      user_id=user_id,
      listing_id=listing_id,
      amount=amount,
      booking_status=booking_status,
      payment_status=payment_status
    )

    try:
      db.session.add(booking)
      db.session.commit()
      return booking
    except Exception as e:
      db.session.rollback()
      # This could be a unique constraint violation or other DB error
      return None

  def __repr__(self):
    return f'<Booking {self.id}: Listing {self.listing_id} - User {self.user_id}>'
