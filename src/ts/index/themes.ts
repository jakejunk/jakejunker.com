/// <reference path="themes/themeManager.ts"/>

namespace Themes
{
    let currentThemeIndex = -1;
    let themeManager: ThemeManager;
    let themes: Theme[] = [
        { displayName: "LIGHTS ON", className: "" },
        { displayName: "LIGHTS OFF", className: "night-vision" }
    ];

    export function Init()
    {
        const currentThemeStr = localStorage.getItem("currentThemeIndex");
        if (currentThemeStr == undefined)
        {
            currentThemeIndex = 0;
        }
        else
        {
            currentThemeIndex = JSON.parse(currentThemeStr) || 0;
        }

        const themeManagerResult = ThemeManager.Create("html", themes[currentThemeIndex]);
        if (themeManagerResult.isError())
        {
            console.warn(themeManagerResult.errorValue);
            return;
        }

        themeManager = themeManagerResult.okValue;
    }

    export function ConfigureThemeButton()
    {
        const themeBtn = Kurz.QuerySelector("button", "#nv");
        if (themeBtn != undefined)
        {
            themeBtn.disabled = false;
            themeBtn.addEventListener("click", function() {
                this.innerText = CycleTheme().displayName;
            });

            themeBtn.innerText = themeManager.currentTheme.displayName;
        }
    }

    function CycleTheme(): Theme
    {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;

        const newTheme = themes[currentThemeIndex];

        themeManager.changeTheme(newTheme);

        localStorage.setItem("currentThemeIndex", currentThemeIndex.toString());

        return newTheme;
    }
}

