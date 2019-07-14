/// <reference path="ajax-helper.ts"/>

/**
 * A namespace for containing elements common to all pages on the site.
 */
namespace Webpage
{
    declare function OnFragmentLoad(): void;

    const _MainContentIdStr = "main";
    const _MainHeaderIdStr = "main-header";

    // Because I'm lazy
    //export let ID: (elementId: string) => HTMLElement = document.getElementById.bind(document);

    /**
     * The main progress bar for ajax requests.
     */
    export let MainProgressBar: HTMLElement;

    /**
     * The main header, which contains the logo and the nav.
     */
    export let MainHeader: HTMLElement;

    /**
     * The container holding all navigation links.
     */
    export let Nav: HTMLElement;

    /**
     * The container holding the main content.
     */
    export let MainContainer: HTMLElement;

    /**
     * The actual content of the page. When a new page is navigated to,
     * this element will be replaced.
     */
    export let MainContent: HTMLElement;


    /**
     * Initializes the webpage by gathering up the important elements.
     * Calling this function is required before accessing things like
     * `Webpage.Nav`, `Webpage.MainContent`, etc.
     */
    export function Init()
    {
        MainProgressBar = document.getElementById("main-progress-bar");
        MainHeader = document.getElementById(_MainHeaderIdStr);
        Nav = document.getElementById("main-nav");
        MainContainer = document.getElementById("main-container");
        MainContent = document.getElementById(_MainContentIdStr);
    }


    /**
     * Swaps the contents of the current webpage. Calling this function results in changes to
     * the `Webpage.MainContent` property.
     */
    export function SwapPageContent(newPage: Document)
    {
        document.title = newPage.title;
        let newContent = newPage.getElementById(_MainContentIdStr);
        
        // Is false when we navigate to a page that doesn't follow the template.
        // Ideally, this should rarely occur... if at all
        if (!newContent)
        {
            newContent = newPage.body.firstElementChild as HTMLElement;
        }

        // Undefine the fragment load function and grab script locations
        (window as any).OnFragmentLoad = undefined;
        let srcs = _StripScriptElements(newPage);
        let needToLoad = srcs.length;

        // TODO: Make this more modular
        MainHeader.className = newPage.getElementById(_MainHeaderIdStr).className;
        
        // Necessary for CSS animations
        newContent.classList.add("new");
        MainContainer.removeChild(MainContent);
        MainContainer.appendChild(newContent);
        MainContent = newContent;
        
        _AttachNewScripts(MainContent, srcs, () => {
            if (--needToLoad <= 0)
            {
                RunFragment();
            }
        });

        MainContent.offsetHeight; // HACK: causes a page reflow before changing className
        MainContent.classList.remove("new");
        
        AjaxHelper.UpdatePageState();
    }


    /**
     * Returns a cookie matching the provided name.
     * Taken from: https://stackoverflow.com/questions/10730362/get-cookie-by-name
     * @param name The name of the cookie to get.
     */
    export function GetCookie(name: string): string
    {
        let match = document.cookie.match(RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
        return match ? match[1] : null;
    }


    /**
     * TODO: Make this better
     */
    export function RunFragment()
    {
        if (typeof OnFragmentLoad !== "undefined")
        {
            //console.log("OnFragmentLoad()");
            OnFragmentLoad();
        }
    }


// Private ========================================================================================

    /**
     * Removes all script elements designated by the "ext-script" classname from the provided Document.
     * The `src` values of these removed script elements are returned.
     */
    function _StripScriptElements(doc: Document): string[]
    {
        let retvals = [] as string[];

        let extraScripts = doc.getElementsByClassName("ext-script");
        while (extraScripts.length > 0)
        {
            let script = extraScripts[0] as HTMLScriptElement;
            script.parentElement.removeChild(script);

            retvals.push(script.src);
        }

        return retvals;
    }


    function _AttachNewScripts(parent: HTMLElement, srcs: string[], callback: () => void)
    {
        for (let i = 0; i < srcs.length; i += 1)
        {
            let newScript = document.createElement("script");
            // Don't think I need to fall back for IE here...
            newScript.onload = callback;
            newScript.src = srcs[i];

            parent.appendChild(newScript);
        }
    }
}