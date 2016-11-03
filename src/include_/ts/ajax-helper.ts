/**
 * Utility namespace for ajax-style functionality.
 * For now, this is just used for faster page loading.
 */
namespace AjaxHelper
{
    export function HasHistoryAPI(): boolean
    {
        let hasHistory = "history" in window;
        let hasPushState = "pushState" in window.history;

        return hasHistory && hasPushState;
    }
}