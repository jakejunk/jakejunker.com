namespace Kurz
{
    /**
     * Represents a <form> element in the DOM with a `data-ajaxTarget` attribute.
     */
    export interface HTMLAjaxFormElement extends HTMLFormElement
    {
        dataset: DOMStringMap & {
            ajaxTarget: string;
        };

        kurzAjaxContext: AjaxContext;
    }

    export namespace HTMLAjaxFormElement
    {
        /**
         * Finds all elements with the selector `form[data-ajax-target]` and initializes them for AJAX functionality.
         */
        export function InitializeAll(ajaxContext: AjaxContext)
        {
            ForEvery("form", "[data-ajax-target]", (form) => {
                const ajaxForm = form as HTMLAjaxFormElement;

                ajaxForm.kurzAjaxContext = ajaxContext;
                ajaxForm.addEventListener("submit", _OnSubmit);
            });
        }

        async function _OnSubmit(this: HTMLAjaxFormElement, ev: Event)
        {
            ev.preventDefault();

            const context = this.kurzAjaxContext;
            const targetSelector = this.dataset.ajaxTarget;
            const url = this.action;
            const formData = new FormData(this);

            await context.navigateTo(url, targetSelector, formData);
        }
    }
}