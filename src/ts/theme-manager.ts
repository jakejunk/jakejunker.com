/**
 * Utility namespace for managing the dynamic swapping between light and dark themes.
 */
namespace ThemeManager
{
    let head_: HTMLHeadElement;
    let lightThemeTag_: HTMLLinkElement;
    let darkThemeTag_: HTMLLinkElement;
    let useDarkTheme_ = false;

    /* NOTE: These are in "backwards" order.
     * The toggle button shows the text of the _next_ theme switch. */
    let themeNames_ = ["LIGHTS OFF", "LIGHTS ON"];


/* Public functions ======================================================== */

    /**
     * Initializes style tags in the head element.
     * Which theme to start in is determined by a cookie.
     */
    export function InitTags(): void
    {
        head_ = document.getElementsByTagName('head')[0];

        if (document.cookie === "")
        {
            document.cookie = "dark=n; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
        }
        else if (document.cookie.split("=")[1] === "y")
        {
            useDarkTheme_ = true;
        }

        lightThemeTag_ = CreateCSSLinkTag_("/include_/css/highlight.css", themeNames_[1], useDarkTheme_);
        darkThemeTag_ = CreateCSSLinkTag_("/include_/css/highlight-dark.css", themeNames_[0], !useDarkTheme_);
    }
    
    /**
     * Initializes the style toggle button.
     */
    export function InitToggleButton(toggleButton: HTMLButtonElement): void
    {
        toggleButton.onclick = OnToggleButtonClick_;
        toggleButton.disabled = false;
        toggleButton.innerHTML = themeNames_[+useDarkTheme_];
    }


    export function IsDarkTheme(): boolean
    {
        return useDarkTheme_;
    }


/* Private functions ======================================================= */

    /**
     * Creates and appends to the head element a link to an external stylesheet.
     */
    function CreateCSSLinkTag_(href: string, title: string, disabled: boolean): HTMLLinkElement
    {
        let result = document.createElement("link");
        result.rel = "stylesheet";
        result.type = "text/css";
        result.href = href;
        result.title = title;

        // FIXME: this is a hack
        result.disabled = disabled;
        head_.appendChild(result);
        result.disabled = disabled;

        return result;
    }


/* Callbacks =============================================================== */

    function OnToggleButtonClick_(this: HTMLButtonElement): void
    {
        darkThemeTag_.disabled = useDarkTheme_;
        useDarkTheme_ = !useDarkTheme_;
        lightThemeTag_.disabled = useDarkTheme_;

        this.innerHTML = themeNames_[+useDarkTheme_];
    }
}