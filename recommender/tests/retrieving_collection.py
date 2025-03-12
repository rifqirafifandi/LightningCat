from recommender import database

db = database.DB()

print(list(db.facility.find()))
