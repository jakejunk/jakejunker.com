/**
 * Utility namespace for ajax-style functionality.
 * For now, this is just used for faster page loading.
 */
namespace AjaxHelper
{
    let currentHref: string;
    let nav: HTMLElement;
    let holder: HTMLElement;
    let currentContent: HTMLElement;
    let mainContentId: string;
    

    export function HasHistoryAPI(): boolean
    {
        let hasHistory = "history" in window;
        let hasPushState = "pushState" in window.history;

        return hasHistory && hasPushState;
    }


    export function InitPageState(navid: string, holderid: string, maincontentid: string): void
    {
        nav = document.getElementById(navid);
        holder = document.getElementById(holderid);
        currentContent = document.getElementById(maincontentid);
        mainContentId = maincontentid;
        
        window.onpopstate = OnPopState_;

        UpdatePageState();
    }

    
    /**
     * Used for determining who is ajax-enabled, as well as saving our current location.
     */
    export function UpdatePageState(): void
    {
        currentHref = document.location.pathname;

        let ajaxLinks = document.getElementsByClassName("ajax") as HTMLCollectionOf<HTMLAnchorElement>;
        for (let i = 0; i < ajaxLinks.length; ++i)
        {
            // FIXME: The cast is needed because of a TypeScript bug relating to generics.
            (ajaxLinks[i] as HTMLAnchorElement).onclick = OnAjaxLinkClick_;
        }
    }


    /**
     * Called when a qualifying link is clicked.
     */
    export function LoadPage(href: string, pushNewState?: boolean, callback?: (err: number) => void): boolean
    {
        console.log("Current page is: ", currentHref);
        console.log("Going to page: ", href);

        let dest = href.split('#')[0];
        if (dest === "" || dest === currentHref)
        {
            // If the clicked link was either 1) a hash link or 2) a link to the current page,
            // then let the default browser behavior take over.
            return true;
        }
        
        // Fetch the requested page
        let req = new XMLHttpRequest();
        req.open("GET", dest, true);
        req.onreadystatechange = function()
        {
            if (req.readyState == 4)
            {
                if(req.status == 200)
                {
                    // Push a new state into the history since we got something back,
                    // but only if we are going to a new page
                    if (pushNewState)
                    {
                        history.pushState(null, null, href);
                    }

                    // Create a temporary HTML doc out of the request's response
                    let temp = document.implementation.createHTMLDocument("test");
                    temp.documentElement.innerHTML = this.responseText;
                    
                    HighlightNavLink_(href);
                    SwapOutDocuments_(temp);

                    if (callback)
                    {
                        callback(200);
                    }
                }
                
                console.log("Server returned code: ", req.status);
            }
            else // request.readyState !== 4
            {
                // TODO: Implement a loading bar, that'd be pretty cool
            }
        }
        req.send();
        return false;
    }


// Private functions =======================================================

    /**
     * Function that is invoked on ajax-enabled links.
     */
    function OnAjaxLinkClick_(event: Event): boolean
    {
        // Get the link destination
        let href = (event.target as HTMLAnchorElement).getAttribute("href");

        // Dims the current content
        currentContent.style.opacity = "0.5";
        
        return LoadPage(href, true, function()
        {
            window.scrollTo(0, 0);
        });
    }


    /**
     * Called when going back and forth in browser history.
     */
    function OnPopState_(e: PopStateEvent): void
    {
        AjaxHelper.LoadPage(document.location.pathname);
    }


    /**
     * Whenever an ajax link is clicked, this will be called to highlight the correct
     * navigation link in the header.
     */
    function HighlightNavLink_(dest: string): void
    {
        // Used for determining which navigation link is current.
        // If a page at "/projects/something/whoa" is requested, then
        // the "/projects/" link is highlighted up top
        let rootDest = dest.substr(0, dest.indexOf("/", 1)) + "/";
        for (let i = 0, l = nav.childNodes.length; i < l; ++i)
        {
            let current = nav.childNodes[i] as HTMLAnchorElement;

            if (current.nodeType === 3)
            {
                continue;
            }
            else if (current.getAttribute("href") === rootDest)
            {
                current.className = "nav-btn current";
            }
            else
            {
                current.className = "nav-btn";
            }
        }
    }


    /**
     * Swaps the contents of the page.
     */
    function SwapOutDocuments_(newDoc: Document): void
    {
        // Grab important part of the new document
        let newContent = newDoc.getElementById(mainContentId);
        newContent.className = "new";

        // Change the title
        document.title = newDoc.title;
    
        // Delete the old stuff from the "real" document and put the new stuff in its place
        holder.removeChild(currentContent);
        holder.appendChild(newContent);

        UpdatePageState();
    
        // The new stuff is now current
        currentContent = newContent;
        currentContent.offsetHeight;    // HACK: causes a page reflow before changing className
        currentContent.className = "";
    }
}