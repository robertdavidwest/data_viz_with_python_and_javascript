import pandas as pd
import numpy as np
from pymongo import MongoClient
import json

pd.set_option('display.width', 180)


def get_mongo_database(db_name, host='localhost', port=27017,
                       username=None, password=None):
    """Get named database from MongoDB with/out authentication"""

    # make Mongo connection with/out authentication
    if username and password:
        mongo_uri = 'mongodb://{}:{}@{}/{}'.format(username,
                                                   password,
                                                   host,
                                                   db_name)
        conn = MongoClient(mongo_uri)
    else:
        conn = MongoClient()

    return conn[db_name]


def mongo_to_dataframe(db_name, collection, query=None,
                       host='localhost', port=27017,
                       username=None, password=None, no_id=True):
    """ Creates a dataframe from mongodb collection"""
    if not query:
        query = {}

    db = get_mongo_database(db_name, host, port, username, password)
    cursor = db[collection].find(query)
    df = pd.DataFrame(list(cursor))

    if no_id:
        df.drop(axis=1, labels='_id', inplace=True)

    return df


def dataframe_to_mongo(df, db_name, collection, host='localhost', port=27017,
                       username=None, password=None):
    """Save a dataframe to mongodb collection"""
    db = get_mongo_database(db_name, host, port, username, password)

    records = df.to_dict('records')
    db[collection].insert(records)


def insert_static_json_into_mongo():
    # Insert 'nobel_winners_scraping' and 'minibios' data into mongodb

    filepath_winners = "/Users/rwest/Documents/Github/data_viz_with_python_and_javascript/" \
               "nobel_winners_scraping/nobel_winners_full.json"

    with open(filepath_winners, 'r') as f:
        nobel_winners = json.load(f)

    filepath_bios = "/Users/rwest/Documents/Github/data_viz_with_python_and_javascript/" \
               "nobel_winners_scraping/minibios.json"

    with open(filepath_bios, 'r') as f:

        s = f.read()

        # the json file contains mutiple arrays that need to be joined
        cleaned = s.replace("][", ", ")
        minibios = json.loads(cleaned)

    client = MongoClient()
    db = client['nobel_prize'] #  creates database

    # create 2 new collections and insert data
    db['winners'].insert_many(nobel_winners)
    db['mini_bios'].insert_many(minibios)


if __name__ == '__main__':

    # only need to run this once
    update = False

    if update:
        insert_static_json_into_mongo()