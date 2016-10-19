# coding=utf-8

import numpy as np
import pandas as pd

import flyingpandas as fp


from json_to_mongo import mongo_to_dataframe, dataframe_to_mongo

pd.set_option('display.width', 180)

def clean_winners(df):
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
    df_born_in = df[df.born_in.notnull()]
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

    df['date_of_birth'] = pd.to_datetime(df['date_of_birth'])
    df['date_of_death'] = pd.to_datetime(df['date_of_death'])

    df['award_age'] = df.year - df.date_of_birth.dt.year

    # convert to strings for mongo (NaT do not seem to work)
    df['date_of_birth'] = df['date_of_birth'].astype(str)
    df['date_of_death'] = df['date_of_death'].astype(str)

    return df, df_born_in

def clean_bios(df):
    # replace all empty strings
    df.replace('', np.nan, inplace=True)

    # remove items from lists
    image_urls = []
    for l in df.image_urls:
        try:
            image_urls.append(l.pop())
        except IndexError:
            image_urls.append(np.nan)

    df['image_urls'] = image_urls

    df = df.drop_duplicates()

    # check duplicate links in bios data - keep those with bio_image
    idx = df.link.duplicated(keep=False)
    dups = df[idx].sort_values('link')
    dups['drop'] = dups['bio_image'].isnull()

    df = df.join(dups['drop'])
    df = df[df['drop'] != True]
    df.drop('drop', axis=1, inplace=True)

    return df


if __name__ == '__main__':

    # only need to run this once
    #insert_static_json_into_mongo()

    df_bios = mongo_to_dataframe('nobel_prize', 'mini_bios')
    df_winners = mongo_to_dataframe('nobel_prize', 'winners')

    # Clean Data
    df_winners, df_winners_born_in = clean_winners(df_winners)
    df_bios = clean_bios(df_bios)

    # create merged dataset
    df_winners_all = fp.merge("m:1", df_winners, df_bios,on='link', how='left')

    # save to mongo
    dataframe_to_mongo(df_winners, 'nobel_prize', 'winners_clean')
    dataframe_to_mongo(df_winners_born_in, 'nobel_prize', 'winners_born_in_clean')
    dataframe_to_mongo(df_winners_all, 'nobel_prize', 'winners_all_clean')