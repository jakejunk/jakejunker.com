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
    
    AjaxHelper.InitPageState("main-nav", "main", "title-bar", "main-content");
    window.onpopstate = OnPopState;
}


/**
 * Called when the user is about to exit the page.
 * Keep it short and quick...
 */
function OnExit(): void
{
    var cookieValue = ThemeManager.IsDarkTheme()? 'y' : 'n';
	document.cookie = "dark=" + cookieValue + "; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
}


/**
 * Called when going back and forth in browser history.
 */
function OnPopState(): void
{
    AjaxHelper.LoadPage(document.location.pathname, true);
}