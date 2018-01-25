var TOPSTORIES_MAX  = 15 // Max Top stories to show in top column
var MORE_MAX        = 20 // Max stories to show under top stories More link
var LATEST_MAX      = 10 // Max stories to show under Latest column
var WORDCLOUD_MAX   = 35 // Max keywords in word cloud

var datafile = '../../data/_data.json'
var uberdata

/***
 * Load data and call createHTML()
 ***/
function createNewspaper(){
    $.getJSON(datafile, function(data){
        uberdata = data
        dispCurrentDateTime(uberdata['_timestamp_'])
        createTopStories()
        createLatestStoriesTable()
        createAdditionalStoriesTable()
        createKeywordCloud()
        //createCausesTable()
    });
}

/***
 * Create Top Stories table
 ***/
function createTopStories(){
    var str = ''
            + '<br/>'
            + '<span class="SectionHeader">Top Stories</span>'
            + '<hr/>'
    var keys = uberdata['_src_order_']
    var numstories = Math.min(TOPSTORIES_MAX, keys.length)
    for(var i=0; i<numstories; i++){
        k = keys[i]
        if(uberdata[k].length == 0){
            continue
        }
        str += createSrcTopStories(k)
        if(i<TOPSTORIES_MAX-1){
            str += '<hr/>'
        }
    }
    document.getElementById("TopStories").innerHTML = str
}

/***
 * Create HTML entry for given source
 ***/
function createSrcTopStories(src,mode){
    var str = ''
    var data = uberdata[src]['data']
    d = data.sort(sortDataBy("score"))[0]
    var url = d['url']

    var summaryColSpan  = 1
    var imageRowSpan    = 2
    var linkColSpan     = 1
    var imageClass      = 'TopStoriesImage'
    var summaryClass    = 'TopStoriesSummary'
    var linkClass       = 'StoryLink'
    var additional      = 0

    if(mode == '-Additional'){
        summaryColSpan  = 1
        imageRowSpan    = 1
        linkColSpan     = 2
        imageClass      = 'AdditionalTopImage'
        summaryClass    = 'AdditionalStoriesSummary'
        linkClass       = 'AdditionalStoryLink'
        additional      = 1
    }

    str += '<table class="TopStories" cellpadding=0 cellspacing=0 border=0>'
        + '<tr>'
        + '<td>'
        + '<table class="InnerTopStories" cellpadding=0 cellspacing=0 border=0 onmouseover=makeElementVisible("'+url+'") onmouseout=makeElementInVisible("'+url+'")>'
        + '<tr>'
        + '<td colspan="'+linkColSpan+'">'
        + '<a class="'+linkClass+'" href=' + url + '>' + d['title'] + '</a>'
        + '<br/>'
        + '<span class="TopStoriesPublisherAndDate">'
        + d['source']

    if (d['publish_date'] != ''){
        str += ' - '
        str += d['publish_date']
    }
    str += '</span>'
    str += '</td>'

    // TOP IMAGE -- if Top Story
    if(d['top_image'] != "" && !additional){
        str += '<td rowspan="'+imageRowSpan+'" align=right valign=top>'
            + '<a href="'+ url +'">'
            + '<img class="'+imageClass+'" src="' + d['top_image'] + '"/>'
            + '</a>'
            + '<div class="SocialMediaTopStory" id="'+url+'">' + insertSocialMediaButtons(d) + '</div>'
            + '</td>'
    }

    str += '</tr>'
        + '<tr>'
        + '<td colspan="'+summaryColSpan+'">'
        + '<br/>'
        + '<div class="'+summaryClass+'">' + d['summary'] + '...</div>'
        + '</td>'

    // TOP IMAGE -- if Additional Story
    if(d['top_image'] != "" && additional){
        str += '<td rowspan="'+imageRowSpan+'" align=right valign=bottom>'
            + '<a href="'+ url +'">'
            + '<img class="'+imageClass+'" src="' + d['top_image'] + '"/>'
            + '</a>'
            + '<div class="SocialMediaTopStory" id="'+url+'">' + insertSocialMediaButtons(d) + '</div>'
            + '</td>'
    }

    str += '<tr>'
        + '<td colspan="2">'
        + '<span class="Tags">Tags: </span>'
        + '<span class="Keywords">' + mergeKeywords(d['keywords'], d['nlp_keywords']) + '</span>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<td>'
        + '<br/>'

    var more = Math.min(MORE_MAX,uberdata[src]['more'] - 1)
    if(more > 0){
        str += '<div class="MoreFrom" id="' + src + '">'
            + '<span class="MoreFrom" onClick=showMoreTopStories("' + src + '")>Show ' + more + ' more from ' + uberdata[src]['data'][0]['source'] + '...</span>'
            + '</div>'
            + '<br/>'
    }
    str += '</td>'
        + '</tr>'
        + '</table>'
    return str
}

/***
 * Show more stories from the src
 ***/
function showMoreTopStories(src){
    var more = Math.min(MORE_MAX,uberdata[src]['more'] - 1)
    var str = ''
            + '<span class="MoreFrom" onClick=showLessTopStories("' + src + '")>Show ' + more + ' less from ' + uberdata[src]['data'][0]['source'] + '...</span>'
            + '<br/><br/>'
            + '<table>'
            + '<tr>'
            + '<td class="MoreMargin"></td>'
            + '<td>'
            + createMoreSrcHTML(src)
            + '</td>'
            + '</tr>'
            + '</table>'
            + '<br/>'
            + '<span class="MoreFrom" onClick=showLessTopStories("' + src + '")>Show ' + more + ' less from ' + uberdata[src]['data'][0]['source'] + '...</span>'
    document.getElementById(src).innerHTML = str
}

/***
 * Show less stories from the src
 ***/
function showLessTopStories(src, url){
    var more = Math.min(MORE_MAX,uberdata[src]['more'] - 1)
    var str = ''
    str += '<span id="span_'+src+'" class="MoreFrom" onClick=showMoreTopStories("' + src + '")>Show ' + more + ' more from ' + uberdata[src]['data'][0]['source'] + '...</span>'

    document.getElementById(src).innerHTML = str
    var id = "#span_" + src
    $(id).animate({backgroundColor:'yellow', color:'#666666'},'slow').animate({backgroundColor:'#ffffff', color:'#1A5276'},3000);
    makeElementInVisible(url)
}

/***
 * Create more HTML entry for given source
 ***/
function createMoreSrcHTML(src){
    var data = uberdata[src]['data']
    data.sort(sortDataBy("score"))

    var numstories = MORE_MAX
    if(data.length < MORE_MAX){
        numstories = data.length
    }

    var str = ''
            + '<table class="InnerTopStoriesTableMore">'
    for(var i=1; i<numstories; i++){
        d = data[i]
        str += '<tr>'
            + '<td>'
            + '<table class="InnerTopStoriesTableMore">'
            + '<tr>'
            + '<td colspan=2>'
            + '<a class="StoryLinkMore" href=' + d['url'] + '>' + d['title'] + '</a>'
            + '<span class="MorePublisherAndDate">'

        if (d['publish_date'] != ''){
            str += ' - ' + d['publish_date']
        }
        str += '</span>'
            + '<br/>'
            + '</td>'
            + '</tr>'
            + '<tr>'
            + '<td colspan="2">'
            + '<span class="TagsMore">Tags: </span>'
            + '<span class="KeywordsMore">' + mergeKeywords(d['keywords'], d['nlp_keywords']) + '</span>'
            + '</td>'
            + '</tr>'
            + '</table>'
            + '</td>'
            + '</tr>'
    }
    str += '</table>'
    return str
}

/***
 * Create Additional stories section
 ***/
function createAdditionalStoriesTable(){
    var src = uberdata['_src_order_']
    if(src.length <= TOPSTORIES_MAX){
        return
    }

    var str = ''
            + '<br/>'
            + '<span class="SectionHeader">Additional Stories</span>'
            + '<hr/>'
            + '<table border=0 cellpadding=10 cellspacing=5>'
            + '<tr>'
            + '<td>'

    var half_1 = Math.ceil((src.length - TOPSTORIES_MAX)/2)
    var half_2 = src.length - half_1
    var startIdx = TOPSTORIES_MAX
    var stopIdx = TOPSTORIES_MAX + half_1

    for(var i=startIdx; i<stopIdx; i++){
        k = src[i]
        if(uberdata[k]['data'].length == 0){
            continue
        }
        str += createSrcTopStories(k,'-Additional')
        if(i < stopIdx - 1){
            str += '<hr/>'
        }


    }
    str += '</td>'
        + '<td>'

    startIdx = TOPSTORIES_MAX + half_1
    stopIdx = src.length

    for(var i=startIdx; i<stopIdx; i++){
        k = src[i]
        if(uberdata[k]['data'].length == 0){
            continue
        }
        str += createSrcTopStories(k,'-Additional')
        if(i < stopIdx - 1){
            str += '<hr/>'
        }
    }

    str += '</td>'
        + '</tr>'
        + '</table>'

    document.getElementById("AdditionalStories").innerHTML = str
}

/***
 * Create Latest Stories table
 ***/
function createLatestStoriesTable(){
    var str = ''
            + '<br/>'
            + '<span class="SectionHeader"><center>Latest Stories</center></span>'
            + '<hr/>'
            + '<table class="LatestStories" width="100%">'

    var latest = uberdata['_latest_']

    var numstories = LATEST_MAX
    if(latest.length < LATEST_MAX){
        numstories = latest.length
    }

    for(var i=0; i<numstories; i++){
        var d = latest[i]
        var keywords = mergeKeywords(d['keywords'],d['nlp_keywords'])
        str += '<tr>'
            + '<td>'
            + '<a class="LatestStoryLink tooltip" href=' + d['url'] + '>' + d['title'] + '</a>'
            + '<br/>'
            + '<span class="LatestStoryPublisherAndDate">'
            + d['source']
            + ' - '
            + d['publish_date']
            + '</span>'
            + '<br/>'
            + '<span class="TagsLatest">Tags: </span>'
            + '<span class="KeywordsLatest">' + keywords + '</span>'
            + '<br/><br/>'
            + '</td>'
            + '</tr>'
    }
    str += '</table>'
    document.getElementById("TodayStories").innerHTML = str
}

/***
 * Merge keywords
 ***/
function mergeKeywords(k1str, k2str){
    k1 = k1str.split(",")
    k2 = k2str.split(",")
    k = k1.concat(k2)

    var uniquek = [];
    $.each(k, function(i, el){
        if($.inArray(el, uniquek) === -1) uniquek.push(' ' + el.trim(0));
    });
    return uniquek + "" // forced conversion to string
}

/***
 * Create keyword cloud
 ***/
function createKeywordCloud(){
    //return
    var str = ''
            + '<br/>'
            + '<br/>'
            + '<center><span class="SectionHeader">Most Frequent Tags</span><center/>'
            + '<hr/>'
            + '<div id="KeywordCloud">'
            + '</div>'
    var keywords = uberdata['_keyword_count_']

    var words = []
    for(var k in keywords){
        if(k.length < 3){ continue }
        var count = keywords[k]
        words.push({text: k, weight: count, link: './tagged.html?tag=' + k})
    }
    // sort words
    words.sort(function (a,b) {
        return b.weight - a.weight;
    });

    var topwords = words.slice(0,Math.min(WORDCLOUD_MAX, words.length))
    document.getElementById('Keywords').innerHTML = str

    $('#KeywordCloud').jQCloud(topwords, {
        shape:      'rectangular',
        //autoResize: true,
        colors:     ["#666666","#888888"],
        fontSize:   {from: 0.2, to: 0.05}
    });
}

/***
 * Create tagged stories
 ***/
function createTaggedNews(tag){
    $.getJSON(datafile, function(data){
        uberdata = data
        dispCurrentDateTime(uberdata['_timestamp_'])
        createTaggedTopStories(tag)
    });
}

/***
 * Create tagged top stories
 ***/
function createTaggedTopStories(tag){
    var str = ''
            + '<br/>'
            + '<span class="SectionHeader">Top Stories for "'+tag+'"</span>'
            + '<hr/>'
    var keys = uberdata['_src_order_']
    var numstories = Math.min(TOPSTORIES_MAX, keys.length)
    for(var i=0; i<numstories; i++){
        k = keys[i]
        if(uberdata[k].length == 0){
            continue
        }
        str += createTaggedSrcTopStories(k, tag)
    }
    str += '<br/><a class="AdditionalStoryLink" href="http://www.seveneightsix.info">Back to Home</a><br/><br/>'
    document.getElementById("TopStories").innerHTML = str
}

/***
 * Create list of stories where given tag is found
 ***/
function createTaggedSrcTopStories(src, tag){
    var data = uberdata[src]['data'].sort(sortDataBy("score"))
    var taggeddata = []

    // Find stories for this src that have the keyword
    for(var i=0; i<data.length; i++){
        var d = data[i]
        var mergedkeywords = mergeKeywords(d['keywords'], d['nlp_keywords'])
        if (mergedkeywords.indexOf(tag) != -1){
            taggeddata.push(d)
        }
    }
    if (taggeddata.length == 0){
        return ''
    }

    var str             = ''
    var data            = taggeddata.sort(sortDataBy("score"))
    var source          = taggeddata[0]['source']
    var d               = data[0]
    var url             = d['url']
    var summaryColSpan  = 1
    var imageRowSpan    = 2
    var linkColSpan     = 1
    var keywordColSpan  = 2
    var imageClass      = 'TopStoriesImage'
    var summaryClass    = 'TopStoriesSummary'
    var linkClass       = 'StoryLink'
    var additional      = 0

    // Top story
    str += '<table class="TopStories" cellpadding=1 cellspacing=0 border=0>'
        + '<tr>'
        + '<td colspan="2">'
        + '<table class="InnerTopStories" cellpadding=0 cellspacing=1 border=0 onmouseover=makeElementVisible("'+url+'") onmouseout=makeElementInVisible("'+url+'")>'
        + '<tr>'
        + '<td colspan="'+linkColSpan+'">'
        + '<a class="'+linkClass+'" href=' + url + '>' + d['title'] + '</a>'
        + '<br/>'
        + '<span class="TopStoriesPublisherAndDate">'
        + d['source']

    if (d['publish_date'] != ''){
        str += ' - '
        str += d['publish_date']
    }
    str += '</span>'
    str += '</td>'

    if(d['top_image'] != "" && !additional){
        str += '<td rowspan="'+imageRowSpan+'" align=right valign=top>'
            + '<a href="'+ url +'">'
            + '<img class="'+imageClass+'" src="' + d['top_image'] + '"/>'
            + '</a>'
            + '<div class="SocialMediaTopStory" id="'+url+'">' + insertSocialMediaButtons(d) + '</div>'
            + '</td>'
    }
    str += '</tr>'
        + '<tr>'
        + '<td colspan="'+summaryColSpan+'">'
        + '<br/>'
        + '<div class="'+summaryClass+'">' + d['summary'] + '...</div>'
        + '</td>'

    str += '<tr>'
        + '<td colspan='+keywordColSpan+'>'
        + '<span class="Tags">Tags: </span>'
        + '<span class="Keywords">' + mergeKeywords(d['keywords'], d['nlp_keywords']) + '</span>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '<br/>'
        + '</td>'
        + '</tr>'

    var more = Math.min(MORE_MAX,taggeddata.length - 1)
    if(more > 0){
        str += '<tr>'
            +  '<td colspan=2>'
            +  '<div class="MoreFrom" id="' + src + '">'
            +  '<span class="MoreFrom" onClick=showMoreTaggedTopStories("' + src + '","' + tag + '")>Show ' + more + ' more from ' + source + '...</span>'
            +  '</div>'
            +  '<br/>'
            +  '</td>'
            +  '</tr>'
    }
    str += '</td>'
        +  '</tr>'
        +  '</table>'
        +  '<hr/>'

    return str
}

/***
 * Show more tagged stories from the src
 ***/
function showMoreTaggedTopStories(src, tag){
    var data = uberdata[src]['data'].sort(sortDataBy("score"))
    var taggeddata = []
    for(var i=0; i<data.length; i++){
        var d = data[i]
        var mergedkeywords = mergeKeywords(d['keywords'], d['nlp_keywords'])
        if (mergedkeywords.indexOf(tag) != -1){
            taggeddata.push(d)
        }
    }
    var source = taggeddata[0]['source']
    var more = Math.min(MORE_MAX,taggeddata.length - 1)
    var str = ''
            + '<span class="MoreFrom" onClick=showLessTaggedTopStories("' + src + '","' + tag + '")>Show ' + more + ' less from ' + source + '...</span>'
            + '<br/><br/>'
            + '<table>'
            + '<tr>'
            + '<td class="MoreMargin"></td>'
            + '<td>'
            + createMoreTaggedSrcHTML(src, tag)
            + '</td>'
            + '</tr>'
            + '</table>'
            + '<br/>'
            + '<span class="MoreFrom" onClick=showLessTaggedTopStories("' + src + '","' + tag + '")>Show ' + more + ' less from ' + source + '...</span>'
    document.getElementById(src).innerHTML = str
}

/***
 * Show less tagged stories from the src
 ***/
function showLessTaggedTopStories(src, tag){
    var data = uberdata[src]['data'].sort(sortDataBy("score"))
    var taggeddata = []
    for(var i=0; i<data.length; i++){
        var d = data[i]
        var mergedkeywords = mergeKeywords(d['keywords'], d['nlp_keywords'])
        if (mergedkeywords.indexOf(tag) != -1){
            taggeddata.push(d)
        }
    }
    var source = taggeddata[0]['source']
    var more = Math.min(MORE_MAX,taggeddata.length - 1)

    var str = ''
    str += '<span id="taggedspan_'+src+'" class="MoreFrom" onClick=showMoreTaggedTopStories("' + src + '","' + tag + '")>Show ' + more + ' more from ' + source + '...</span>'

    document.getElementById(src).innerHTML = str
    var id = "#taggedspan_" + src
    $(id).animate({backgroundColor:'yellow', color:'#666666'},'slow').animate({backgroundColor:'#ffffff', color:'#1A5276'},3000);
}

/***
 * Create more tagged HTML entry for given source
 ***/
function createMoreTaggedSrcHTML(src, tag){
    var data = uberdata[src]['data'].sort(sortDataBy("score"))
    var taggeddata = []
    for(var i=0; i<data.length; i++){
        var d = data[i]
        var mergedkeywords = mergeKeywords(d['keywords'], d['nlp_keywords'])
        if (mergedkeywords.indexOf(tag) != -1){
            taggeddata.push(d)
        }
    }

    var str = '<table class="InnerTopStoriesTableMore">'
    for(var i=1; i<taggeddata.length; i++){
        d = taggeddata[i]
        str += '<tr>'
            + '<td>'
            + '<table class="InnerTopStoriesTableMore">'
            + '<tr>'
            + '<td colspan=2>'
            + '<a class="StoryLinkMore" href=' + d['url'] + '>' + d['title'] + '</a>'
            + '<span class="MorePublisherAndDate">'

        if (d['publish_date'] != ''){
            str += ' - ' + d['publish_date']
        }
        str += '</span>'
            + '<br/>'
            + '</td>'
            + '</tr>'
            + '<tr>'
            + '<td colspan="2">'
            + '<span class="TagsMore">Tags: </span>'
            + '<span class="KeywordsMore">' + mergeKeywords(d['keywords'], d['nlp_keywords']) + '</span>'
            + '</td>'
            + '</tr>'
            + '</table>'
            + '</td>'
            + '</tr>'
    }
    str += '</table>'
    return str
}
