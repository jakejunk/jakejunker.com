/**
 * A namespace for containing elements common to all pages on the site.
 */
namespace Webpage
{
    let _MainContentIdStr = "main";

    // Because I'm lazy
    export let ID: (elementId: string) => HTMLElement = document.getElementById.bind(document);

    /**
     * The main progress bar for ajax requests.
     */
    export let MainProgressBar: HTMLElement

    /**
     * The container holding all navigation links.
     */
    export let Nav: HTMLElement

    /**
     * The container holding the main content.
     */
    export let MainContainer: HTMLElement

    /**
     * The actual content of the page. When a new page is navigated to,
     * this element will be replaced.
     */
    export let MainContent: HTMLElement


    /**
     * Initializes the webpage by gathering up the important elements.
     * Calling this function is required before accessing things like
     * `Webpage.Nav`, `Webpage.MainContent`, etc.
     */
    export function Init()
    {
        MainProgressBar = ID("main-progress-bar");
        Nav = ID("main-nav");
        MainContainer = ID("main-container");
        MainContent = ID(_MainContentIdStr);
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
        // Ideally, this should rarely occur... if at all.
        if (!newContent)
        {
            newContent = newPage.body.firstElementChild as HTMLElement;
        }
        
        // Necessary for CSS animations
        newContent.className = "new";
    
        MainContainer.removeChild(MainContent);
        MainContainer.appendChild(newContent);
        AjaxHelper.UpdatePageState();
    
        // The new stuff is now current
        MainContent = newContent;
        MainContent.offsetHeight;    // HACK: causes a page reflow before changing className
        MainContent.className = "";
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
}