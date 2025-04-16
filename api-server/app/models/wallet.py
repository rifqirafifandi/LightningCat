from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import ENUM

WALLET_STATUS = ['active', 'suspended', 'closed']

class Wallet(db.Model):
  __tablename__ = 'wallet'

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
  balance = db.Column(db.Numeric(12, 2), nullable=False, default=0.00)
  currency = db.Column(db.String(3), nullable=False, default='SGD')
  status = db.Column(ENUM(*WALLET_STATUS, name='wallet_status', create_type=False), nullable=False, default='active')
  created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
  updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

  # Relationship with User model
  user = db.relationship('User', backref=db.backref('wallet', uselist=False, lazy=True))

  def to_dict(self):
    return {
      'id': self.id,
      'user_id': self.user_id,
      'balance': float(self.balance),
      'currency': self.currency,
      'status': self.status,
      'created_at': self.created_at.isoformat() if self.created_at else None,
      'updated_at': self.updated_at.isoformat() if self.updated_at else None
    }

  @classmethod
  def get_wallet(cls, user_id):
    return cls.query.filter_by(user_id=user_id).first()

  @classmethod
  def create_wallet(cls, user_id, currency='SGD', status='active'):
    wallet = cls(
      user_id=user_id,
      currency=currency,
      status=status
    )

    db.session.add(wallet)
    db.session.commit()
    return wallet

  @classmethod
  def update_balance(cls, wallet_id, amount):
    wallet = cls.query.get(wallet_id)
    if not wallet:
      return None

    wallet.balance += amount
    wallet.updated_at = datetime.utcnow()

    db.session.commit()
    return wallet

  @classmethod
  def update_status(cls, wallet_id, status):
    wallet = cls.query.get(wallet_id)
    if not wallet:
      return None

    wallet.status = status
    wallet.updated_at = datetime.utcnow()

    db.session.commit()
    return wallet

  def __repr__(self):
    return f'<Wallet {self.id}: {self.user_id}>'
