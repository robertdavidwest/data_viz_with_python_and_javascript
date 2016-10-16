# data_viz_with_python_and_javascript


## Items needed to re-create dataset:

This repository is a collection of all of the work I have completed when following along with the book [Data Visualization with Python & Javascript](https://www.amazon.com/Data-Visualization-Python-JavaScript-Transform/dp/1491920513). To re-create this project I suggest working through the book. In addition to the book, I have attempted to outline some of the steps below.

The book outlines quite a few alternative methods as you work through it. I'm attempting to distill the most appropriate methods for me. I chose to use `MongoDB` as my database of preference. The book does also explain how to just make a static we page which is often used for D3 design and also offers a SQL alternative.

If you look at the reviews on amazon, they are a little mixed, and I understand why. I love that this book exists and want it attempts to do. It exactly what I was looking for, but at times it is hard to follow and it cn be unclear which pieces of code are just for learning and which pieces you need to keep. I found myself book marking many different pages that I needed to refer back to as I worked. But I also found that I really had to understand the content to handle this. You're not able to just copy the code and replicate the project. With that said, hopefully this repo will help keep you on track if you get too lost. 

### Part I. Basic Toolkit

This is a great section to get going. If you were in my position when starting this book (knowing Python but not Javascript), this section provides a useful bridge and a handy cheat sheet for comparing the two languages. It also gives an overview to webdev.

### Part II. Getting Your Data

Using the python tools `beautifulsoup4` and `scrapy` to obtain the data from wikipedia

* See the subdirectory `/nobel_winners_scraping` in the repo for all scraping code and scraped data. This directory contains all needed scraping tools to refresh data as well as the
datasets themselves after they were scraped.
* To refresh the scraped data, just follow these steps (from Chapter 6: Heavyweight Scraping with Scrapy):
* Inside the repo to run scrapy just do:

        $ cd nobel_winners_scraping
        $ scrapy crawl nwinners_full -o nobel_winners_full.json

* Then to get the mini bio and images run the next spider:

        $ scrapy crawl nwinners_minibio -o minibios.json

	**IMPORTANT NOTE:** At the time of execution I'm using `scrapy '1.1.3'`. There is some kind of bug preventing redirects, which was stopping the images from being downloaded in the scrape. I've hacked round this by making the following change. In the file `scrapy/pipelines.media.py`, in the function definition
	`_check_media_to_download()` I've set:

	     request.meta['handle_httpstatus_all'] = False
	from `True`. This appears to be an open issue on [Github](https://github.com/scrapy/scrapy/issues/2004) so hopefully it gets
	resolved in the near future.

### Part III. Cleaning and Exploring Data with Pandas

#### Mongo 

* See the subdirectory `/clean_data`
* The script `json_to_mongo.py` will outline how to get the data from json into mongo
* Using Pymongo:
    * [This](http://api.mongodb.com/python/current/tutorial.html) simple guide is really useful and covers some important points that don't appear in "Data Viz with Python & Javascript"
    
    To use Mongo as a local host first install mongo then fire it up in the command prompt
    
        $ mongod
    
    Then we you use pymongo it will be able to connect to the client
    
        >>> from pymongo import MongoClient
        >>> client = MongoClient()
        
    Now you can run the script `json_to_mongo.py` and the functions inside 
    
#### Cleaning

* The script `clean_data.py` clean the two datasets`nobel_winners` and `minibios` obtained in Part II. These datasets are then merged to 'winners_all` and the resulting dataset is store in our mongo database