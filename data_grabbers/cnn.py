import sys
import newspaper
import re
import traceback
sys.path.append('..')
import utils as U

####################
# Get data from site
####################
def getData(url, source, maxurls):
    src      = 'cnn'
    count    = 0
    paper    = newspaper.build(url,memoize_articles=False, language='en')
    uberdata = []
    urlcache = U.getUrlCache(src)
    logfile  = U.getLogdir() + "/" + src + ".log"

    U.logger(logfile, "Begin processing %s..." % src)

    articles = removeUnwantedUrls(paper.articles)
    length = len(articles)

    if maxurls is None or maxurls > length:
        maxurls = length

    for article in articles[0:maxurls]:
        count += 1
        print "[%d/%d] %s" % (count, length, article.url)
        U.logger(logfile, "[%d/%d] URL: %s" % (count, length, article.url))

        # If article.url is alrady in cache...
        if article.url in urlcache:
            continue

        # If article.url has already been seen in this run... (prevent double-counting)
        if article.url in urlcache:
            continue

        urlcache.append(article.url)
        try:
            article.download()
            article.parse()

            title = article.title
            if title == 'Error':
                continue

            text = article.text
            if len(text) < 10:
                continue

            (keywords,score) = U.findKeywordsInText(text)
            if len(keywords) == 0:
                continue

            if article.publish_date is not None:
                publish_date = article.publish_date.strftime("%B %d, %Y")
            else:
                publish_date = ''

            article.nlp()

            # TODO: This needs improvement
            summary = text.split('(CNN)')
            if len(summary) > 1:
                summary = summary[1]
            else:
                summary = summary[0]

            max_summary_len = U.getMaxSummaryLen()
            if len(summary) > max_summary_len:
                summary = summary[0:max_summary_len]

            data = dict()
            data['url']          = article.url
            data['top_image']    = article.top_image
            data['publish_date'] = publish_date
            data['authors']      = article.authors
            data['nlp_keywords'] = U.list2str(article.keywords)
            data['keywords']     = U.list2str(keywords)
            data['title']        = title
            data['source']       = source
            data['score']        = score
            data['summary']      = summary
            uberdata.append(data)
        except:
            print traceback.format_exc()
            U.logger(logfile, traceback.format_exc())

    U.cacheUrls(urlcache, src)
    U.logger(logfile, "Done.")

    print "### CNN DATA GRABBER ###"

    return uberdata

#######################
# Remove unwanted URL's
#######################
def removeUnwantedUrls(articles):
    articles_ = []
    for article in articles:
        if re.search('/health/',        article.url) \
            or not re.search('cnn.com', article.url):
            continue
        articles_.append(article)
    return articles_
