from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import ENUM, JSONB

TRANSACTION_TYPES = ['deposit', 'withdrawal', 'payment', 'refund', 'fee', 'commission', 'deduction']
TRANSACTION_STATUS = ['pending', 'completed', 'failed', 'reversed', 'canceled']

class Transaction(db.Model):
  __tablename__ = 'transactions'

  id = db.Column(db.Integer, primary_key=True)
  wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=False)
  booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=True)
  listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=True)
  amount = db.Column(db.Numeric(12, 2), nullable=False)
  transaction_type = db.Column(ENUM(*TRANSACTION_TYPES, name='transaction_type', create_type=False), nullable=False)
  status = db.Column(ENUM(*TRANSACTION_STATUS, name='transaction_status', create_type=False), nullable=False, default='pending')
  reference = db.Column(db.String(255), nullable=True)
  description = db.Column(db.Text, nullable=True)
  payment_metadata = db.Column(JSONB, default={})
  created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
  updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relationships
  wallet = db.relationship('Wallet', backref=db.backref('transactions', lazy=True))
  booking = db.relationship('Booking', backref=db.backref('transactions', lazy=True))
  listing = db.relationship('Listing', backref=db.backref('transactions', lazy=True))

  def to_dict(self):
    return {
      'id': self.id,
      'wallet_id': self.wallet_id,
      'booking_id': self.booking_id,
      'listing_id': self.listing_id,
      'amount': float(self.amount),
      'transaction_type': self.transaction_type,
      'status': self.status,
      'reference': self.reference,
      'description': self.description,
      'payment_metadata': self.payment_metadata,
      'created_at': self.created_at.isoformat() if self.created_at else None,
      'updated_at': self.updated_at.isoformat() if self.updated_at else None
    }

  @classmethod
  def get_transaction(cls, transaction_id):
    return cls.query.get(transaction_id)

  @classmethod
  def get_wallet_transactions(cls, wallet_id):
    return cls.query.filter_by(wallet_id=wallet_id).order_by(cls.created_at.desc()).all()

  @classmethod
  def get_booking_transactions(cls, booking_id):
    return cls.query.filter_by(booking_id=booking_id).all()

  @classmethod
  def get_listing_transactions(cls, listing_id):
    return cls.query.filter_by(listing_id=listing_id).all()

  @classmethod
  def create_transaction(cls, wallet_id, amount, transaction_type, booking_id=None, listing_id=None, 
                        status='pending', reference=None, description=None, payment_metadata=None):
    transaction = cls(
      wallet_id=wallet_id,
      booking_id=booking_id,
      listing_id=listing_id,
      amount=amount,
      transaction_type=transaction_type,
      status=status,
      reference=reference,
      description=description,
      payment_metadata=payment_metadata or {}
    )

    db.session.add(transaction)
    db.session.commit()
    return transaction

  @classmethod
  def update_status(cls, transaction_id, status):
    transaction = cls.query.get(transaction_id)
    if not transaction:
      return None

    transaction.status = status
    transaction.updated_at = datetime.utcnow()

    db.session.commit()
    return transaction

  def __repr__(self):
    return f'<Transaction {self.id}: {self.transaction_type} {self.amount}>'
