namespace Kurz
{
    export function ForceReflow(element?: HTMLElement)
    {
        element = element || document.documentElement;

        void(element.offsetHeight);
    }
}