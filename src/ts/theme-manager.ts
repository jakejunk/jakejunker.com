/**
 * Utility namespace for managing the dynamic swapping between light and dark themes.
 */
namespace ThemeManager
{
    let _head: HTMLHeadElement;
    let _lightThemeTag: HTMLLinkElement;
    let _darkThemeTag: HTMLLinkElement;
    let _useDarkTheme = false;

    // NOTE: These are in "backwards" order.
    // The toggle button shows the text of the _next_ theme switch.
    let _themeNames = ["LIGHTS OFF", "LIGHTS ON"];


/* Public functions ======================================================== */

    /**
     * Initializes style tags in the head element.
     * Which theme to start in is determined by a cookie.
     */
    export function InitTags(): void
    {
        _head = document.getElementsByTagName('head')[0];

        if (document.cookie === "")
        {
            document.cookie = "dark=n; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
        }
        else if (document.cookie.split("=")[1] === "y")
        {
            _useDarkTheme = true;
        }

        _lightThemeTag = CreateCSSLinkTag_("/_include/css/theme-light.css", _themeNames[1], _useDarkTheme);
        _darkThemeTag = CreateCSSLinkTag_("/_include/css/theme-dark.css", _themeNames[0], !_useDarkTheme);
    }
    
    /**
     * Initializes the style toggle button.
     */
    export function InitToggleButton(toggleButton: HTMLButtonElement): void
    {
        toggleButton.onclick = OnToggleButtonClick_;
        toggleButton.disabled = false;
        toggleButton.innerHTML = _themeNames[+_useDarkTheme];
    }


    export function IsDarkTheme(): boolean
    {
        return _useDarkTheme;
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
        _head.appendChild(result);
        result.disabled = disabled;

        return result;
    }


/* Callbacks =============================================================== */

    function OnToggleButtonClick_(this: HTMLButtonElement): void
    {
        _darkThemeTag.disabled = _useDarkTheme;
        _useDarkTheme = !_useDarkTheme;
        _lightThemeTag.disabled = _useDarkTheme;

        this.innerHTML = _themeNames[+_useDarkTheme];
    }
}