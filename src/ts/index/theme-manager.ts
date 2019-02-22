/**
 * Utility namespace for managing the dynamic swapping between light and dark themes.
 */
namespace ThemeManager
{
    let _themeElement: HTMLElement;
    let _useDarkTheme = false;


    // NOTE: These are in "backwards" order.
    // The toggle button shows the text of the _next_ theme switch.
    let _themeNames  = ["LIGHTS OFF", "LIGHTS ON"];


/* Public functions ======================================================== */

    /**
     * Which theme to start in is determined by a cookie.
     */
    export function Init(): void
    {
        _themeElement = document.documentElement;
        if (!_themeElement)
        {
            return;
        }

        let isDark = Webpage.GetCookie("dark");
        if (isDark === null)
        {
            document.cookie = "dark=n; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
        }
        else if (isDark === "y")
        {
            _useDarkTheme = true;
        }

        // Workaround explanation:
        // The background property of the html element is set to transition,
        // so disable it temporarily to prevent "flashes" of color 
        _themeElement.style.transition = "none";
        _UpdateTheme();
        // This fixes background flashing in Edge, but causes animation issues in Chrome ¯\_(ツ)_/¯
        //_themeElement.offsetLeft; // Force reflow
        _themeElement.style.transition = "";
    }
    
    /**
     * Initializes the style toggle button.
     */
    export function InitToggleButton(toggleButton: HTMLButtonElement): void
    {
        toggleButton.onclick = _OnToggleButtonClick;
        toggleButton.disabled = false;
        toggleButton.innerHTML = _themeNames[+_useDarkTheme];
    }


    export function IsDarkTheme(): boolean
    {
        return _useDarkTheme;
    }


// Private ========================================================================================

    function _UpdateTheme()
    {
        if (_useDarkTheme)
        {
            _themeElement.classList.add("night-vision");
        }
        else
        {
            _themeElement.classList.remove("night-vision");
        }
    }


// Callbacks ======================================================================================

    function _OnToggleButtonClick(this: HTMLButtonElement): void
    {
        _useDarkTheme = !_useDarkTheme;
        _UpdateTheme();

        // Sets button text
        this.innerHTML = _themeNames[+_useDarkTheme];

        let cookieValue = _useDarkTheme? 'y' : 'n';
	    document.cookie = "dark=" + cookieValue + "; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
    }
}