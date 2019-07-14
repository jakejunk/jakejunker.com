namespace Kurz
{
    /**
     * Runs a callback for each element that matches the specified group of selectors
     */
    export function ForEvery<T extends keyof HTMLElementTagNameMap>
        (tagName: T, otherSelectors: string, callbackFn: (value: HTMLElementTagNameMap[T]) => void)
    {
        const selectedElements = QuerySelectorAll(tagName, otherSelectors);

        for (const element of selectedElements)
        {
            callbackFn(element);
        }
    }
}