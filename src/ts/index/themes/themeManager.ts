/// <reference path="../kurz/util/result.ts"/>

/**
 * Utility class for managing the dynamic swapping between themes.
 */
class ThemeManager
{
    static DefaultTheme: Readonly<Theme> = {
        displayName: "default",
        className: ""
    };

    private _containerElement: HTMLElement;
    private _currentTheme: Theme;

    private constructor(containerElement: HTMLElement, initialTheme: Theme)
    {
        this._containerElement = containerElement;
        this._currentTheme = initialTheme;

        // Prevent "flashes" of color
        this._containerElement.style.transition = "none";

        this.changeTheme(initialTheme);

        // This fixes background flashing in Edge, but causes animation issues in Chrome ¯\_(ツ)_/¯
        //_containerElement.offsetLeft; // Force reflow
        // TODO: Use old value of transition instead
        this._containerElement.style.transition = "";
    }

    static Create(containerSelector: string, initialTheme?: Theme): Kurz.Result<ThemeManager, string>
    {
        const containerElement = document.querySelector<HTMLElement>(containerSelector);
        if (containerElement == undefined)
        {
            return Kurz.Result.OfError("Theme container element was not found.");
        }
        else if (!(containerElement instanceof HTMLElement))
        {
            return Kurz.Result.OfError("Selected element is not an HTMLElement.");
        }
        
        return Kurz.Result.OfOk(new ThemeManager(containerElement, initialTheme || ThemeManager.DefaultTheme));
    }

    get containerElement(): Readonly<HTMLElement>
    {
        return this._containerElement;
    }

    get currentTheme(): Readonly<Theme>
    {
        return this._currentTheme;
    }

    changeTheme(theme: Theme)
    {
        const classList = this._containerElement.classList;

        if (classList.length > 0)
        {
            classList.remove(this._currentTheme.className);
        }
        
        if (theme.className)
        {
            classList.add(theme.className);
        }

        this._currentTheme = theme;
    }
}
