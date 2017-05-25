/**
 * Utility namespace for ajax-style functionality.
 * For now, this is just used for faster page loading.
 */
namespace AjaxHelper
{
    let _currentHref: string;
    

    /**
     * Returns a boolean value representing whether or not the browser can support
     * the History API, which is needed for Ajax capabilities.
     */
    export function IsAvailable(): boolean
    {
        let hasHistory = "history" in window;
        let hasPushState = "pushState" in window.history;

        return hasHistory && hasPushState;
    }


    export function Init(): void
    {
        window.onpopstate = _OnPopState;
        Webpage.Init();
        UpdatePageState();
    }

    
    /**
     * Used for determining who is ajax-enabled, as well as saving our current location.
     */
    export function UpdatePageState(): void
    {
        _currentHref = document.location.pathname;

        // Gather ajax links
        let ajaxLinks = document.getElementsByClassName("ajax") as HTMLCollectionOf<HTMLAnchorElement>;
        for (let i = 0; i < ajaxLinks.length; ++i)
        {
            ajaxLinks[i].onclick = _OnAjaxLinkClick;
        }

        // Round up potential forms on the page
        for (let i = 0; i < document.forms.length; ++i)
        {
            document.forms[i].onsubmit = _OnFormSubmit;
        }
    }


    /**
     * Called when a qualifying link is clicked.
     */
    export function LoadPage(href: string, pushNewState?: boolean, callback?: (status: number) => void,
                             method = "GET", elements?: HTMLFormControlsCollection): boolean
    {
        let dest = href.split('#')[0];
        if (dest === "" || dest === _currentHref)
        {
            // If the clicked link was either 1) a hash link or 2) a link to the current page,
            // then let the default browser behavior take over.
            return true;
        }
        
        // Fetch the requested page
        let req = new XMLHttpRequest();
        req.onreadystatechange = function()
        {
            if (req.readyState === 4)
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
                
                _HighlightNavLink(href);
                Webpage.SwapPageContent(temp);

                if (callback)
                {
                    callback(req.status);
                }
            }
            else // request.readyState !== 4
            {
                // TODO: Implement a loading bar, that'd be pretty cool
            }
        }
        req.open(method, dest, true);

        if (method === "POST")
        {
            let data = "";
            for (let i = 0; i < elements.length; ++i)
            {
                let e = elements[i] as HTMLFormElement;
                if (e.type !== "submit")
                {
                    if (i !== 0)
                    {
                        data += "&";
                    }
                    data += e.name + "=" + e.value;
                }
            }

            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            req.send(data);
        }
        else
        {
            req.send();
        }
        return false;
    }


// Private functions =======================================================

    /**
     * Function that is invoked on ajax-enabled links.
     */
    function _OnAjaxLinkClick(event: Event): boolean
    {
        // Get the link destination
        let target = event.target as HTMLAnchorElement;
        let href   = target.getAttribute("href");

        if (href)
        {
            // Dims the current content
            Webpage.MainContent.style.opacity = "0.5";
            
            return LoadPage(href, true, function(status)
            {
                // TODO: Do we care if it 404s?
                window.scrollTo(0, 0);
            });
        }

        return true;
    }


    function _OnFormSubmit(event: Event): boolean
    {
        let target = event.target as HTMLFormElement;
        let elements = target.elements;
        
        // Dims the current content
        Webpage.MainContent.style.opacity = "0.5";
        
        return LoadPage(target.action, true, function(status)
        {
            // TODO: Do we care if it 404s?
            window.scrollTo(0, 0);
        }, "POST", elements);
    }


    /**
     * Called when going back and forth in browser history.
     */
    function _OnPopState(e: PopStateEvent): void
    {
        AjaxHelper.LoadPage(document.location.pathname);
    }


    /**
     * Whenever an ajax link is clicked, this will be called to highlight the correct
     * navigation link in the header.
     */
    function _HighlightNavLink(dest: string): void
    {
        // Used for determining which navigation link is current.
        // If a page at "/projects/something/whoa" is requested, then
        // the "/projects/" link is highlighted up top
        let rootDest = dest.substr(0, dest.indexOf("/", 1)) + "/";
        for (let i = 0, nav = Webpage.Nav, l = nav.childNodes.length; i < l; ++i)
        {
            let current = nav.childNodes[i] as HTMLAnchorElement;

            if (current.nodeType !== 3)
            {
                if (current.getAttribute("href") === rootDest)
                {
                    current.className = "nav-btn current";
                }
                else
                {
                    current.className = "nav-btn";
                }
            }
        }
    }
}