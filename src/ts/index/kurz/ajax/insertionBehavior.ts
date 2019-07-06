namespace Kurz
{
    /**
     * TODO: Not used anywhere yet.
     */
    export const enum InsertionBehavior
    {
        /**
         * Replaces the target element.
         * 
         * @example
         * Before:
         * <div id="target"></div>
         * 
         * After:
         * <div id="fetched"></div>
         */
        REPLACE,

        /**
         * Appends the response after the target element.
         * 
         * @example
         * Before:
         * <div id="target"></div>
         * 
         * After:
         * <div id="target"></div>
         * <div id="fetched"></div>
         */
        APPEND_AFTER,

        /**
         * Inserts the response as the last child of the target element.
         * 
         * @example
         * Before:
         * <div id="target"></div>
         * 
         * After:
         * <div id="target">
         *     <div id="fetched"></div>
         * </div>
         */
        INSERT_AS_CHILD
    }
}