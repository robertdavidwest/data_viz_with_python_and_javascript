# coding=utf-8
from json_to_mongo import mongo_to_dataframe
import numpy as np
import pandas as pd


def clean_data(df):
    """
    If more uncode characters are needed, see here:

    http://unicode-table.com/en/#latin-extended-b

    """
    # replace all empty strings
    df.replace('', np.nan, inplace=True)

    # clean winners
    df.name = df.name.str.replace("*", "")
    df.name = df.name.str.strip()

    # there are duplicate winners for winners that were have wiki pages
    # for both the country they were born in and the country they were
    # given the prize

    df = df[df.born_in.isnull()]
    df.drop('born_in', axis=1, inplace=True)

    df = df[~(df.name == 'Marie Curie')]

    # deal with anomalous data
    msk = df.name == u'Marie Sk\u0142odowska-Curie'
    msk &= df.year == 1911
    df.loc[msk, 'country'] = 'France'

    df = df[~(df.year == 1809)]

    msk = df.name == 'Sidney Altman'
    msk &= df.year == 1990
    df = df[~msk]

    # for the remaining prizes duplicated by country pick one at random

    df = df.reindex(np.random.permutation(df.index))
    df = df.drop_duplicates(['name', 'year'])
    df = df.sort_index()

    df.loc[df.name == 'Alexis Carrel', 'category'] = 'Physiology or Medicine'
    df.loc[df.name == u'R\u00F3bert B\u00E1r\u00E1ny', 'category'] = 'Physiology or Medicine'
    df.loc[df.name == 'Amartya Sen', 'category'] = 'Economics'


    df = df[df.gender.notnull()]  # remove genderless entries

    print df.count()
    import ipdb
    ipdb.set_trace()


    return df

if __name__ == '__main__':


    # only need to run this once
    #insert_static_json_into_mongo()

    df_winners_bios = mongo_to_dataframe('nobel_prize', 'mini_bios')
    df_winners = mongo_to_dataframe('nobel_prize', 'winners')

    # Clean Data
    df_winners = clean_data(df_winners)
    print df_winners.count()

    dups = df_winners[df_winners.duplicated('name', keep=False)].sort_values('name')
    print dups[['name', 'country', 'year', 'category']].head(20)

    # replace all empty strings
    df_winners_bios.replace('', np.nan, inplace=True)



