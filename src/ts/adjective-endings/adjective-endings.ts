/// <reference path="../index/webpage.ts"/>


/**
 * Called when either:
 * 1. After the page first loads (normally), after the DOM finishes loading
 * 2. After the script is injected (Ajax)
 */
function OnFragmentLoad()
{
    AdjectiveEndings.Init();
}


namespace AdjectiveEndings
{
    let _Container: HTMLElement;

    export function Init(): void
    {
        _Container = Webpage.ID("sentence");

        // Test
        _Container.innerText = "Wie gefallt Ihnen der weisse Hut?"
    }
}