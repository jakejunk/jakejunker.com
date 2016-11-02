var dark = false;
var theme = ["Dark Theme", "Light Theme"];

// Run this stuff as soon as the javascript is loaded =========================
// Handle cookies
if (document.cookie === "")
{
	document.cookie = "dark=n; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
}
if (document.cookie.split("=")[1] === "y")
{
	dark = true;
}

var headtag = document.getElementsByTagName('head')[0];

// Load the selected stylesheet along with the other as an alternative
var sheetTag1 = document.createElement("link");
sheetTag1.rel = "stylesheet";
sheetTag1.type = "text/css";
sheetTag1.href = "/include/css/highlight.css";
sheetTag1.title = theme[dark | 0];
sheetTag1.disabled = dark;              // Stupid hack
headtag.appendChild(sheetTag1);
sheetTag1.disabled = dark;              // Stupid hack

var sheetTag2 = document.createElement("link");
sheetTag2.rel = "stylesheet";
sheetTag2.type = "text/css";
sheetTag2.href = "/include/css/highlight-dark.css";
sheetTag2.title = theme[!dark | 0];
sheetTag2.disabled = !dark;             // Stupid hack
headtag.appendChild(sheetTag2);
sheetTag2.disabled = !dark;             // Stupid hack

var curhref, nav, currentContent, holder, titleBar, done = true;

// Run before the page is left
window.onbeforeunload = function()
{
	var cval = (dark === true) ? 'y' : 'n';
	document.cookie = "dark="+ cval +"; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
}

// Run this stuff as soon as the page is loaded ===============================
window.onload = function()
{
    // Hook event for toggling night-vision
    var nvbutton = document.getElementById("nv");
	nvbutton.onclick = function()
	{
		sheetTag2.disabled = dark;
        dark = !dark;
        sheetTag1.disabled = dark;
        this.innerHTML = theme[dark | 0];
		return false;
	}
    nvbutton.disabled = false;
    nvbutton.innerHTML = theme[dark | 0];
    
    // Bail out if the browser isn't good enough for us
    if (!(window.history && window.history.pushState)) return;
    
    nav = document.getElementById("main-nav");
    holder = document.getElementById("main");
    titleBar = document.getElementById("title-bar");
    currentContent = document.getElementById("main-content");
	updatePageState();
    
    // When going back and forth in browser history
    window.onpopstate = function(event)
    {
        ajaxPageLoad(document.location.pathname, true);
    }
}

// The function that is called on ajax-enabled links
var onAjaxLinkClick = function(event)
{
    return ajaxPageLoad(event.target.getAttribute("href"), false);
}

// Called whenever we need to reexamine who is ajax-enabled, along with our current location
var updatePageState = function()
{
    curhref = document.location.pathname;
    var links = document.getElementsByClassName("ajax");
    for (var i = 0; i < links.length; ++i)
    {
        links[i].onclick = onAjaxLinkClick;
    }
}

// Called when a qualifying link is clicked
var ajaxPageLoad = function(href, back)
{
    var dest = href.split('#')[0];
    if (dest === "" || dest === curhref) return true;
    
    // Don't update the history if we're going back
    if (!back)
    {
        history.pushState(null, null, href);
    }
    
    // Dims the current content, and then highlights the correct nav link up top
    currentContent.style.opacity = 0.5;
    for (var i = 0, l = nav.childNodes.length; i < l; ++i)
    {
        var current = nav.childNodes[i];
        if (current.nodeType === 3) continue;
    
        if (current.getAttribute("href") === dest)
        {
            current.className = "ani-button current";
        }
        else
        {
            current.className = "ani-button";
        }
    }
    
    var request = new XMLHttpRequest();
    request.open("GET", dest, true);
    request.onreadystatechange = function()
    {
        if (request.readyState == 4)
        {
            if(request.status == 200)
            {
                // Build the new stuff
                var temp = document.implementation.createHTMLDocument("test");
                temp.documentElement.innerHTML = this.responseText;
                var newTitle = temp.getElementById("title-bar");
                var newContent = temp.getElementById("main-content");
                document.title = temp.title;
            
                // Delete the old stuff and put the new stuff in its place
                holder.removeChild(titleBar);
                holder.removeChild(currentContent);
                window.scrollTo(0,0);
                
                newContent.className = "new";
                holder.appendChild(newTitle);
                holder.appendChild(newContent);
                updatePageState();
            
                // The new stuff is now current
                titleBar = newTitle;
                currentContent = newContent;
                currentContent.offsetHeight;    // HACK
            
                // Move the new stuff in
                currentContent.className = "";
            }
        }
        else
        {
            
        }
    }
    request.send();
    return false;
};