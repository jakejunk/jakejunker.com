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
            ajaxLinks[i].onclick = OnAjaxLinkClick_;
        }
    }


    /**
     * Called when a qualifying link is clicked.
     */
    export function LoadPage(href: string, back: boolean): boolean
    {
        let dest = href.split('#')[0];
        if (dest === "" || dest === currentHref) return true;
        
        // Don't update the history if we're going back
        if (!back)
        {
            history.pushState(null, null, href);
        }
        
        // Dims the current content
        currentContent.style.opacity = "0.5";

        // Highlights the correct nav link up top
        for (let i = 0, l = nav.childNodes.length; i < l; ++i)
        {
            let current = nav.childNodes[i] as HTMLAnchorElement;
            if (current.nodeType === 3)
            {
                continue;
            }
        
            if (current.getAttribute("href") === dest)
            {
                current.className = "nav-btn current";
            }
            else
            {
                current.className = "nav-btn";
            }
        }
        
        // Fetch the requested page
        let request = new XMLHttpRequest();
        request.open("GET", dest, true);
        request.onreadystatechange = function()
            {
                if (request.readyState == 4)
                {
                    if(request.status == 200)
                    {
                        // Create a temporary HTML doc out of the request's response
                        let temp = document.implementation.createHTMLDocument("test");
                        temp.documentElement.innerHTML = this.responseText;

                        SwapOutDocuments_(temp);
                    }
                }
                else // request.readyState !== 4
                {
                    // TODO?
                }
            }
        request.send();
        return false;
    }


// Private functions =======================================================

    /**
     * Function that is invoked on ajax-enabled links.
     */
    function OnAjaxLinkClick_(event: Event)
    {
        let target = event.target as HTMLAnchorElement;
        return LoadPage(target.getAttribute("href"), false);
    }


    /**
     * Swaps the contents of the page.
     */
    function SwapOutDocuments_(newDoc: Document): void
    {
        // Grab important parts of the new document
        let newContent = newDoc.getElementById(mainContentId);
        document.title = newDoc.title;
    
        // Delete the old stuff from the "real" document and put the new stuff in its place
        holder.removeChild(currentContent);
        window.scrollTo(0,0);
        newContent.className = "new";
        holder.appendChild(newContent);

        UpdatePageState();
    
        // The new stuff is now current
        currentContent = newContent;
        currentContent.offsetHeight;    // HACK
    
        // Move the new stuff in
        currentContent.className = "";
    }
}