namespace Kurz
{
    /**
     * Returns the first child element that matches the specified group of selectors.
     * If `baseElement` is not specified, the entire document is searched.
     */
    export function QuerySelector<T extends keyof HTMLElementTagNameMap>
        (name: T, otherSelectors: string, baseElement: HTMLElement | Document = document): HTMLElementTagNameMap[T] | null
    {
        return baseElement.querySelector(name + otherSelectors);
    }

    /**
     * Returns a static (not live) NodeList of child elements matching the specified group of selectors.
     * If `baseElement` is not specified, the entire document is searched.
     */
    export function QuerySelectorAll<T extends keyof HTMLElementTagNameMap>
        (name: T, otherSelectors: string, baseElement: HTMLElement | Document = document): NodeListOf<HTMLElementTagNameMap[T]>
    {
        return baseElement.querySelectorAll(name + otherSelectors);
    }
}