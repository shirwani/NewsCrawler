/***
 * Create page header
 ***/
function createPageHeader(){
    var str = ''
            + '<table width="100%" cellpadding="0" cellspacing="0">'
            + '<tr>'
            + '<td valign="bottom" align="left" width="333">'
            //+ '<img width=150 src="./pics/786logo.png"/>'
            + '<img width=150 src="./pics/crypto.jpeg"/>'
            + '</td>'
            + '<td align=right>'
            + insertHeaderBannerAd()
            + '</td>'
            + '</tr>'
            + '</table><hr/>'
     document.getElementById('PageHeader').innerHTML = str
}

/***
 * Create Main Menu
 ***/
function createMainMenu(current){
    var str = ''
            + '<table id="MenuTable" width="100%" cellpadding="10" cellspacing="5">'
            + '<tr>'
            + '<td class="Menu" id="datetime"></td>'
            + '<td class="Menu" id="HeaderSocialMediaLink">' + insertSocialMediaButtons({'url':'http://seveneightsix.info', 'title':'News Aggregator', 'source':'SevenEightSix'}) + '</td>'
            + '</tr>'
            + '</table>'
    document.getElementById("MainMenu").innerHTML = str
}

/***
 * Create page footer
 ***/
function createPageFooter(){
    var str = ''
            + insertFooterBannerAd()
            + '<hr/>'
            + '<br/>'
    document.getElementById("PageFooter").innerHTML = str
}

/***
 * Display current date & time
 ***/
function dispCurrentDateTime(updated){
    var str = ''
            + 'Updated: ' + updated

    document.getElementById('datetime').innerHTML = str
}

/***
 * Sort data by specified property
 ***/
function sortDataBy(prop){
   return function(a,b){
      if( a[prop] < b[prop]){
          return 1;
      }else if(a[prop] > b[prop]){
          return -1;
      }
      return 0;
   }
}

function insertSocialMediaButtons(d){
    var url = "'" + d['url'] + "'"
    var title = "'" + d['title'] + "'"
    var source = "'" + d['source'] + "'"

    var str = ''
            + insertFBShareButton(url)
            + insertTwitterButton(url)
            + insertEmailButton(url,title,source)
    return str
}

/***
 * Insert FB Share button
 ***/
function insertFBShareButton(url){
    return '<img style="cursor:pointer" height=20 src="./pics/fb-share.png" onmouseover="FBShareButtonHover(this);" onmouseout="FBShareButtonUnHover(this);" onclick="openFBShareDialog('+url+');" />'
}
function openFBShareDialog(url){
    window.open('http://www.facebook.com/sharer.php?s=100&&p[url]=' + url, 'popup', 'width=600,height=600');
}
function FBShareButtonHover(element) {
    element.setAttribute('src', './pics/fb-share-hover.png');
}
function FBShareButtonUnHover(element) {
    element.setAttribute('src', './pics/fb-share.png');
}

/***
 * Insert Twitter button
 ***/
function insertTwitterButton(url){
    return '<img style="cursor:pointer" height=20 src="./pics/twitter.png" onmouseover="TwitterButtonHover(this);" onmouseout="TwitterButtonUnHover(this);" onclick="openTwitterDialog('+url+');"/>'
}
function openTwitterDialog(url){
    window.open('https://twitter.com/intent/tweet?text='+url , 'popup', 'width=600,height=600');
}
function TwitterButtonHover(element) {
    element.setAttribute('src', './pics/twitter-hover.png');
}
function TwitterButtonUnHover(element) {
    element.setAttribute('src', './pics/twitter.png');
}

/***
 * Insert Email button
 ***/
function insertEmailButton(url, title, source){
    // remove single quotes
    var u = url.substring(1, url.length-1)
    var t = title.substring(1, title.length-1)
    var s = source.substring(1, source.length-1)

    return '<a href="mailto:?subject='+s+ ': ' +t+'&body='+u+'"><img style="cursor:pointer" height=20 src="./pics/email.png" onmouseover="EmailButtonHover(this);" onmouseout="EmailButtonUnHover(this);"/></a>'
}
function sendEmail(url,title){

}
function EmailButtonHover(element) {
    element.setAttribute('src', './pics/email-hover.png');
}
function EmailButtonUnHover(element) {
    element.setAttribute('src', './pics/email.png');
}

/***
 * Make element in/visible
 ***/
function makeElementVisible(id){
    document.getElementById(id).style.visibility = "visible"
}
function makeElementInVisible(id){
    document.getElementById(id).style.visibility = "hidden"
}
