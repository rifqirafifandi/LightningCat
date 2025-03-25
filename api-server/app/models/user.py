from app.extensions import db

class User(db.Model):
  __tablename__ = 'users'

  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(255), nullable=False, unique=True)

  # Relationship with Profile
  profile = db.relationship('Profile', uselist=False, back_populates='user', cascade='all, delete-orphan')

  # Relationship with OAuthAccount
  oauth_accounts = db.relationship('OAuthAccount', back_populates='user', cascade='all, delete-orphan')

  def to_dict(self):
    return {
      'id': self.id,
      'email': self.email
    }

  @classmethod
  def get_or_create(cls, email):
    user = cls.query.filter_by(email=email).first()

    if not user:
      user = cls(email=email)
      db.session.add(user)
      db.session.flush()

    return user

class Profile(db.Model):
  __tablename__ = 'profiles'

  id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
  name = db.Column(db.String(255), nullable=False)
  profile_image = db.Column(db.Text, nullable=True)
  preferences = db.Column(db.JSON, default={})

  # Relationship with User
  user = db.relationship('User', back_populates='profile')

  def to_dict(self):
    return {
      'name': self.name,
      'profile_image': self.profile_image,
      'preferences': self.preferences
    }

  @classmethod
  def get_or_create(cls, user_id, name):
    profile = cls.query.filter_by(id=user_id).first()

    if not profile:
        profile = cls(id=user_id, name=name)
        db.session.add(profile)

    return profile


class OAuthAccount(db.Model):
  __tablename__ = 'oauth_accounts'

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  provider = db.Column(db.String(50), nullable=False)
  provider_user_id = db.Column(db.String(255), nullable=False)

  # Relationship with User
  user = db.relationship('User', back_populates='oauth_accounts')

  __table_args__ = (
    db.UniqueConstraint('provider', 'provider_user_id', name='uq_oauth_provider_id'),
  )

  @classmethod
  def get_user_by_provider_details(cls, provider, provider_user_id):
    oauth_account = cls.query.filter_by(
      provider=provider,
      provider_user_id=provider_user_id
    ).first()

    if oauth_account:
      return oauth_account.user

    return None
