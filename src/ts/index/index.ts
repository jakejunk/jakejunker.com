/// <reference path="themes.ts"/>

declare function OnFragmentLoad(): void;

Themes.Init();

window.addEventListener("DOMContentLoaded", () => {

    Themes.ConfigureThemeButton();

    const ajaxContextResult = Kurz.AjaxContext.Create();
    if (ajaxContextResult.isError())
    {
        console.warn(ajaxContextResult.errorValue);
        return;
    }

    const context = ajaxContextResult.okValue;

    context.setLoadingIndicator(".nav-bar-logo", "loading");
    context.setTransitionOutClass("new");
    context.setTransitionInClass("new");
    context.addEventListener("documentfetched", OnDocumentFetched);
    context.addEventListener("scriptsloaded", OnScriptsLoaded);
    context.refreshContext();

    OnScriptsLoaded();
});

function OnDocumentFetched(fetchedDocument: Document)
{
    const mainHeaderId = "main-header";
    const fetchedHeader = fetchedDocument.getElementById(mainHeaderId);
    const currentHeader = document.getElementById(mainHeaderId);

    if (fetchedHeader != undefined && currentHeader != undefined)
    {
        currentHeader.className = fetchedHeader.className;
    }

    const currentNavLinkSelector = "a.nav-btn.current";
    const fetchedNavLink = fetchedDocument.querySelector(currentNavLinkSelector);
    const currentNavLink = document.querySelector(currentNavLinkSelector);

    if (fetchedNavLink == undefined || currentNavLink == undefined)
    {
        return;
    }

    currentNavLink.classList.remove("current");

    const fetchedNavLinkHref = fetchedNavLink.getAttribute("href");
    const newCurrentNavLink = document.querySelector(`a.nav-btn[href="${fetchedNavLinkHref}"]`);

    if (newCurrentNavLink != undefined)
    {
        newCurrentNavLink.classList.add("current");
    }
}

function OnScriptsLoaded()
{
    if (typeof OnFragmentLoad === "function")
    {
        OnFragmentLoad();

        // Hacky, but fixes the issue of loading functions "living" too long
        (OnFragmentLoad as unknown) = undefined; 
    }
}