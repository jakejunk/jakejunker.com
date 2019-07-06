/**
 * Called when either:
 * 1. After the page first loads (normally), after the DOM finishes loading
 * 2. After the script is injected (Ajax)
 */
function OnFragmentLoad()
{
    BannerFun.Init("descriptor");
}


namespace BannerFun
{
    let _element: HTMLElement;
    let _possibilities = [
        "a dreamer",
        "a tinkerer",
        "okay I guess",
        "sorta cool sometimes",
        "mom's favorite",
        "extraordinary",
        "adventurous",
        "about average height",
        "street smart",
        "with it",
        "mostly bearded",
        "decent with small talk",
        "smells pretty good",
        "very supportive",
        "a good hugger",
        "used to be flexible",
        "still young",
        "an anglophone",
        "60% water",
        "human, I promise",
        "a dog person",
        "a good listener",
        "video game creator",
        "a nerd",
        "a dork",
        "right-handed",
        "100% certified organic",
        "free-spirited",
        "available in HD",
        "a quality individual",
        "scared of insects",
        "likes heights",
        "clever sometimes",
        "enthusiastic",
        "postmodern",
        "moderately tan",
        "enjoys a nice rain",
        "mildly asthmatic",
        "passionate",
        "on GitHub!",
        "double-jointed",
        "often hungry",
        "currently single",
        "enjoys hiking",
        "always learning",
        "a night owl",
        "scared of oceans",
    ];


    export function Init(toggleElementId: string)
    {
        const toggleElement = document.getElementById(toggleElementId);
        if (toggleElement == undefined)
        {
            throw new Error(`Element "${toggleElementId}" not found.`);
        }

        _element = toggleElement;
        _element.addEventListener("click", _OnDescriptorClick, false);
    }


// Private ========================================================================================

    let _lastIndex = 0;

    export function _OnDescriptorClick()
    {
        let index = (Math.random() * _possibilities.length) | 0;
        if (index === _lastIndex)
        {
            // Prevent immediate repeats
            // Clicking looks "broken" if the text doesn't change
            index = (Math.random() * _possibilities.length) | 0;
        }
        _lastIndex = index;

        // Scales down the old text, and then after 100ms scales the new text back up
        _element.classList.add("out");
        setTimeout(() => {
            _element.innerText = _possibilities[index];
            _element.classList.remove("out");
        }, 100);
    }
}