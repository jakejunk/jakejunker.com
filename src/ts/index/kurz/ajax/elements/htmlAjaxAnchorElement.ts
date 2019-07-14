namespace Kurz
{
    /**
     * Represents an <a> element in the DOM with a `data-ajaxTarget` attribute.
     */
    export interface HTMLAjaxAnchorElement extends HTMLAnchorElement 
    {
        dataset: DOMStringMap & {
            ajaxTarget: string;
        };

        kurzAjaxContext: AjaxContext;
    }

    export namespace HTMLAjaxLinkElement
    {
        /**
         * Finds all elements with the selector `a[data-ajax-target]` and initializes them for ajax functionality.
         */
        export function InitializeAll(ajaxContext: AjaxContext)
        {
            ForEvery("a", "[data-ajax-target]", (anchor) => {
                const ajaxLink = anchor as HTMLAjaxAnchorElement;

                ajaxLink.kurzAjaxContext = ajaxContext;
                ajaxLink.addEventListener("click", _OnClick);
            });
        }

        async function _OnClick(this: HTMLAjaxAnchorElement, ev: Event)
        {
            ev.preventDefault();
    
            const context = this.kurzAjaxContext;
            const targetSelector = this.dataset.ajaxTarget;
            const url = this.href;

            context.navigateTo(url, targetSelector);
        }
    }
}