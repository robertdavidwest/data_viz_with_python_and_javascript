# api/settings.py

# Optional MONGO variables
#MONGO_HOST = 'localhost'
#MONGO_PORT = 27017
#MONGO_USERNAME = 'user'
#MONGO_PASSWORD = 'user'

URL_PREFIX =  'api'
MONGO_DBNAME = 'nobel_prize'
DOMAIN = {'winners_clean': {
    'schema': {
        'country': {'type': 'string'},
        'category': {'type': 'string'},
        'name': {'type': 'string'},
        'year': {'type': 'integer'},
        'gender': {'type': 'string'}
    }
}}

X_DOMAINS = 'http://127.0.0.1:8080'