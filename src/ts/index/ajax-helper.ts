/// <reference path="webpage.ts"/>

/**
 * Utility namespace for ajax-style functionality.
 * For now, this is just used for faster page loading.
 */
namespace AjaxHelper
{
    //let _currentHref: string;
    

    /**
     * Gets whether or not the browser can support the History API,
     * which is needed for Ajax capabilities.
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
        // Gather ajax links
        let ajaxLinks = document.getElementsByClassName("ajax") as HTMLCollectionOf<HTMLAnchorElement>;
        for (let i = 0; i < ajaxLinks.length; i += 1)
        {
            ajaxLinks[i].onclick = _OnAjaxLinkClick;
        }

        // Round up potential forms on the page
        for (let i = 0; i < document.forms.length; i += 1)
        {
            document.forms[i].onsubmit = _OnFormSubmit;
        }
    }


// Events =========================================================================================

    /**
     * Called when going back and forth in browser history.
     */
    function _OnPopState(e: PopStateEvent): void
    {
        let href = location.pathname + location.hash;
        _GetPage(href, false, false, function(status) {

        });
    }


    /**
     * Function that is invoked on ajax-enabled links.
     */
    function _OnAjaxLinkClick(event: Event)
    {
        let target = event.target as HTMLAnchorElement;

        // Necessary check because I like to assign the `ajax` className to containers of links,
        // and clicking on _just_ the container can break things.
        if (typeof target.pathname !== "undefined")
        {
            let href = target.pathname + target.hash;
            let defaultShouldHappen = _GetPage(href, true, true, function(status) {
                
            });

            if (!defaultShouldHappen)
            {
                event.preventDefault();
            }
        }
    }


    function _OnFormSubmit(event: Event): boolean
    {
        let target = event.target as HTMLFormElement;
        let elements = target.elements;

        let submitButton = target.getElementsByClassName("form-submit")[0] as HTMLButtonElement;
        let progressBar = submitButton.getElementsByClassName("submit-progress-bar")[0] as HTMLElement;
        let text = submitButton.getElementsByClassName("submit-text")[0];

        submitButton.classList.add("in-progress");
        text.innerHTML = "SENDING...";
        
        return _PostToServer(target.action, elements, function(status, doc) {
            
            if (status === 200)
            {
                submitButton.classList.remove("in-progress");
                submitButton.disabled = true;

                if (doc.getElementById("main-content").dataset.result === "true")
                {
                    submitButton.classList.add("success");
                    text.innerHTML = "SENT!";
                }
                else
                {
                    submitButton.classList.add("error");
                    text.innerHTML = "ERROR";
                }
            }
        }, progressBar);
    }


// Private functions ==============================================================================

    /**
     * Called when a qualifying link is clicked or when a form is submitted.
     */
    export function _MakeRequest(href: string, callback: (status: number, doc: Document) => void,
                                 loadingElement?: HTMLElement, method = "GET", elements?: HTMLFormControlsCollection): void
    {
        // Initialize progress of the request
        if (loadingElement)
        {
            loadingElement.dataset.progress = "0";
            loadingElement.offsetHeight;   // HACK: causes a page reflow
        }

        // Fetch the requested page
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() {

            // Update progress of the request
            if (loadingElement)
            {
                loadingElement.dataset.progress = ((req.readyState + 1) * 20).toString();
            }

            if (req.readyState === 4)
            {
                // Create a temporary HTML doc out of the request's response
                let temp = document.implementation.createHTMLDocument("test");
                temp.documentElement.innerHTML = this.responseText;

                if (callback)
                {
                    callback(req.status, temp);
                }
            }
        };
        req.open(method, href, true);

        if (method === "POST")
        {
            let data = "";
            for (let i = 0; i < elements.length; ++i)
            {
                let e = elements[i] as HTMLFormElement;
                if (i !== 0)
                {
                    data += "&";
                }
                data += e.name + "=" + e.value;
            }

            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            req.send(data);
        }
        else
        {
            req.send();
        }
    }


    /**
     * Performs a GET request to the remote server. Returns a boolean value based on whether
     * an Ajax request was made or not, e.g. will return true if the default browser behavior
     * took place (for hashlinks or something).
     * @param href             The requested address.
     * @param pushHistoryState Whether to update the browser history or not.
     * @param showLoading      Whether to display the progress bar.
     * @param callback         A callback returning the status of the request.
     */
    function _GetPage(href: string, pushHistoryState: boolean, showProgress: boolean, callback: (status: number) => void): boolean
    {
        let hrefParts = href.split('#');
        let dest = hrefParts[0];
        let hash = hrefParts[1] || "";

        //  1               2
        if (dest === "" || (dest === document.location.pathname) && pushHistoryState)
        {
            // Let the default behavior take over if:
            // 1) The new destination is just a hash link, or
            // 2) The destination is where we already are, IFF we clicked on link
            //    (because popstate, aka not pushing new history state, changes the location immediately)
            return true;
        }

        Webpage.MainContent.style.opacity = "0.5";
        Webpage.MainContent.style.cursor = "progress";

        _MakeRequest(href, function(status, doc) {
            // Push a new state into the history since we got something back,
            // but only if we are going to a new page
            if (pushHistoryState)
            {
                history.pushState(null, null, href);
            }

            _HighlightNavLink(href);
            Webpage.SwapPageContent(doc);

            if (hash)
            {
                document.getElementById(hash).scrollIntoView();
            }
            else if (pushHistoryState)
            {
                window.scrollTo(0, 0);
                //document.body.focus();
            }

            callback(status);
        }, showProgress? Webpage.MainProgressBar : null);

        return false;
    }


    function _PostToServer(actionHref: string, elements: HTMLFormControlsCollection, callback: (status: number, doc: Document) => void, progressElement?: HTMLElement): boolean
    {
        _MakeRequest(actionHref, function(status, doc) {
            callback(status, doc);
        }, progressElement, "POST", elements);

        return false;
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
        for (let i = 0, nav = Webpage.Nav, l = nav.children.length; i < l; ++i)
        {
            let current = nav.children.item(i) as HTMLAnchorElement;
            if (current.getAttribute("href") === rootDest)
            {
                current.classList.add("current");
            }
            else
            {
                current.classList.remove("current");
            }
        }
    }
}