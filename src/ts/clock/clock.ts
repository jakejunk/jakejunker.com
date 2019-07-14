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
    // For CSS reasons, all clock hands start at their "25% complete" position.
    //const _SecondsOffset = _SecondsPerMinute / 4 * 3;
    //const _HoursOffset   = _SecondsPerHour / 4 * 3;
    //const _HalfDayOffset = _SecondsPerHalfDay / 4 * 3;

    let SecHand: HTMLElement;
    let MinHand: HTMLElement;
    let HourHand: HTMLElement;


    export function Init()
    {
        SecHand = document.getElementById("second-hand");
        MinHand = document.getElementById("minute-hand");
        HourHand = document.getElementById("hour-hand");

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