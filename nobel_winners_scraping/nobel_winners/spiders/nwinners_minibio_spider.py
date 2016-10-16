import scrapy
import re
from scrapy.shell import inspect_response

BASE_URL ='http://en.wikipedia.org'

class NWinnerItemBio(scrapy.Item):
    link = scrapy.Field()
    name = scrapy.Field()
    mini_bio = scrapy.Field()
    image_urls = scrapy.Field()
    bio_image = scrapy.Field()
    images = scrapy.Field()


class NWinnerSpiderBio(scrapy.Spider):
    """ Scrapes the country and link text of the nobel-winners. """

    name = 'nwinners_minibio'
    allowed_domains = ['en.wikipedia.org']
    start_urls = [
        'https://en.wikipedia.org/wiki/List_of_Nobel_laureates_by_country'
    ]

    # C. A parse method to deal with the HTTP response
    def parse(self, response):
        filename = response.url.split('/')[-1]

        h2s = response.xpath('//h2')
        for h2 in list(h2s):
            country = h2.xpath(
                'span[@class="mw-headline"]/text()').extract()

            if country:
                winners = h2.xpath('following-sibling::ol[1]')
                for w in winners.xpath('li'):

                    wdata = {}
                    wdata['link'] = BASE_URL + w.xpath('a/@href').extract()[0]

                    # Process the winner's bio page with
                    # the get_mini_bio method
                    request = scrapy.Request(wdata['link'],
                                             callback=self.get_mini_bio)
                    request.meta['item'] = NWinnerItemBio(**wdata)
                    yield request

    def get_mini_bio(self, response):
        """ Get the winner's bio-text and photo"""

        item = response.meta['item']
        item['image_urls'] = []
        img_src = response.xpath(
            '//table[contains(@class, "infobox")]//img/@src'
        )
        if img_src:
            item['image_urls'] = ['http:' + img_src[0].extract()]
        mini_bio = ''
        paras = response.xpath(
            '//*[@id="mw-content-text"]/p[text() or normalize-space(.)=""]'
        ).extract()

        for p in paras:
            if p == '<p></p>': # the bios-intros stop-point
                break
            mini_bio += p

        # correct for wiki-links
        mini_bio = mini_bio.replace('href="/wiki', 'href="' + BASE_URL + '/wiki')
        mini_bio = mini_bio.replace('href="#', item['link'] + '#')
        item['mini_bio'] = mini_bio
        yield item