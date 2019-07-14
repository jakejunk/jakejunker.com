/**
 * Called when either:
 * 1. The page first loads (normally), after the DOM finishes loading
 * 2. The script is injected (Ajax)
 */
function OnFragmentLoad()
{
    Clock.Init();
}


namespace Clock
{
    const _SecondsPerMinute  = 60;
    const _SecondsPerHour    = 60 * 60;
    const _SecondsPerHalfDay = 60 * 60 * 12;

    let SecHand: HTMLElement;
    let MinHand: HTMLElement;
    let HourHand: HTMLElement;


    export function Init()
    {
        let secHand = document.getElementById("second-hand");
        let minHand = document.getElementById("minute-hand");
        let hourHand = document.getElementById("hour-hand");

        if (!secHand || !minHand || !hourHand)
        {
            throw new Error("A required element is missing.");
        }

        SecHand = secHand;
        MinHand = minHand;
        HourHand = hourHand;

        _SetTimeToNow();
    }


    export function _SetTimeToNow()
    {
        let startTime = new Date();
        let secProgress = startTime.getSeconds();
        let minProgress = startTime.getMinutes() * 60 + secProgress;
        let hourProgress = (startTime.getHours() % 12) * 60 * 60 + minProgress;

        void SecHand.offsetWidth;

        SecHand.style.animationDelay  = "-" + ((secProgress /*+ _SecondsOffset*/) % _SecondsPerMinute) + "s";
        MinHand.style.animationDelay  = "-" + ((minProgress /*+ _HoursOffset*/) % _SecondsPerHour) + "s";
        HourHand.style.animationDelay = "-" + ((hourProgress /*+ _HalfDayOffset*/) % _SecondsPerHalfDay) + "s";
    }
}