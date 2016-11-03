/// <reference path="theme-manager.ts"/>
/// <reference path="ajax-helper.ts"/>


/* Do all this as soon as the script loads */
window.onload = OnStart;
window.onbeforeunload = OnExit;
ThemeManager.InitTags();


/**
 * Called when the DOM is ready.
 */
function OnStart(): void
{
    ThemeManager.InitToggleButton(<HTMLButtonElement>document.getElementById("nv"));

    if (!AjaxHelper.HasHistoryAPI())
    {
        return;
    }
    
    // TODO FIXME
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


/**
 * Called when the user is about to exit the page.
 * Keep it short and speedy...
 */
function OnExit(): void
{
    var cookieValue = ThemeManager.IsDarkTheme()? 'y' : 'n';
	document.cookie = "dark="+ cookieValue +"; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
}


function OnPopState(): void
{

}