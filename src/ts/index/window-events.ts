/// <reference path="ajax-helper.ts"/>
/// <reference path="theme-manager.ts"/>
/// <reference path="webpage.ts"/>


/* Do all this as soon as the script loads */
window.onload = OnStart;
ThemeManager.InitTags();


/**
 * Called when the DOM is ready.
 */
function OnStart(): void
{
    ThemeManager.InitToggleButton(<HTMLButtonElement>Webpage.ID("nv"));

    if (AjaxHelper.IsAvailable())
    {
        AjaxHelper.Init();
    }
}