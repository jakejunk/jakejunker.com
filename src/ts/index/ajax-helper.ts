/**
 * Utility namespace for ajax-style functionality.
 * For now, this is just used for faster page loading.
 */
namespace AjaxHelper
{
    // Keeps the compiler from complaining
    declare function OnFragmentLoad(): void;

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

        /* Once the content has been swapped, any "OnFragmentLoad" should be called (if it exists).
         * The function `OnFragmentLoad()` is used by other script files in place
         * of a "window.onload()" callback. */
        if (document.getElementById("fragment-entry") !== null && typeof OnFragmentLoad !== "undefined")
        {
            OnFragmentLoad();
        }
    }


// Private functions =======================================================

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
        req.onreadystatechange = function()
        {
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
     * an Ajax request was made or not, e.g. will return false if the default browser behavior
     * took place (for hashlinks or something).
     * @param href               The requested address.
     * @param pushHistoryState   Whether to update the browser history or not.
     * @param showLoading        Whether to display the progress bar.
     * @param callback           A callback returning the status of the request.
     */
    function _GetPage(href: string, pushHistoryState: boolean, showProgress: boolean, callback: (status: number) => void): boolean
    {
        let dest = href.split('#')[0];
        if (dest === "" || dest === _currentHref)
        {
            // If the clicked link was either 1) a hash link or 2) a link to the current page,
            // then let the default browser behavior take over.
            return true;
        }

        let progressBar = showProgress? Webpage.MainProgressBar : null;
        _MakeRequest(href, function(status, doc)
        {
            // Push a new state into the history since we got something back,
            // but only if we are going to a new page
            if (pushHistoryState)
            {
                history.pushState(null, null, href);
            }

            _HighlightNavLink(href);
            Webpage.SwapPageContent(doc);

            callback(status);
        }, progressBar);

        return false;
    }


    function _PostToServer(actionHref: string, elements: HTMLFormControlsCollection, callback: (status: number, doc: Document) => void, progressElement?: HTMLElement): boolean
    {
        _MakeRequest(actionHref, function(status, doc)
        {
            callback(status, doc);
        }, progressElement, "POST", elements);

        return false;
    }


    /**
     * Function that is invoked on ajax-enabled links.
     */
    function _OnAjaxLinkClick(event: Event): boolean
    {
        let target = event.target as HTMLAnchorElement;
        let href   = target.getAttribute("href");

        // Necessary check because I like to assign the `ajax` className to containers of links,
        // and clicking on _just_ the container can break things.
        if (href)
        {
            Webpage.MainContent.style.opacity = "0.5";
            return _GetPage(href, true, true, function(status)
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

        let submitButton = target.getElementsByClassName("form-submit")[0] as HTMLButtonElement;
        let progressBar = submitButton.getElementsByClassName("submit-progress-bar")[0] as HTMLElement;
        let text = submitButton.getElementsByClassName("submit-text")[0];

        submitButton.classList.add("in-progress");
        text.innerHTML = "SENDING...";
        
        return _PostToServer(target.action, elements, function(status, doc)
        {
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


    /**
     * Called when going back and forth in browser history.
     */
    function _OnPopState(e: PopStateEvent): void
    {
        // Dims the current content
        Webpage.MainContent.style.opacity = "0.5";

        _GetPage(document.location.pathname, false, false, function(status)
        {
            
        });
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