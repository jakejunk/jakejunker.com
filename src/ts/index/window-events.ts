/// <reference path="ajax-helper.ts"/>
/// <reference path="theme-manager.ts"/>
/// <reference path="webpage.ts"/>


// Do this as soon as the script loads
window.onload = OnStart;
ThemeManager.Init();


/**
 * Called when the DOM is ready.
 */
function OnStart(): void
{
    ThemeManager.InitToggleButton(<HTMLButtonElement>document.getElementById("nv"));

    if (AjaxHelper.IsAvailable())
    {
        AjaxHelper.Init();
        Webpage.RunFragment();
    }
}