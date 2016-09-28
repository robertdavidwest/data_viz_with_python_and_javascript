# data_viz_with_python_and_javascript


## Items needed to re-create dataset:

* See the subdirectory `/nobel_winners` in the repo for all scraping code and scraped data. This directory contains all needed scraping tools to refresh data as well as the
datasets themselves after they were scraped.
* To refresh the scraped data, just follow these steps (from Chapter 6: Heavyweight Scraping with Scrapy):
* Inside the repo to run scrapy just do:

        $ cd nobel_winners
        $ scrapy crawl nwinners_full -o nobel_winners_full.json

* Then to get the mini bio and images run the next spider:

        $ scrapy crawl nwinners_minibio -o minibios.json

	**IMPORTANT NOTE:** At the time of execution I'm using `scrapy '1.1.3'`. There is some kind of bug preventing redirects, which was stopping the images from being downloaded in the scrape. I've hacked round this by making the following change. In the file `scrapy/pipelines.media.py`, in the function definition
	`_check_media_to_download()` I've set:

	     request.meta['handle_httpstatus_all'] = False
	from `True`. This appears to be an open issue on [Github](https://github.com/scrapy/scrapy/issues/2004) so hopefully it gets
	resolved in the near future.