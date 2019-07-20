namespace Kurz
{
    /**@internal*/
    export type DocumentFetchedListener = (fetchedDocument: Document) => void;

    /**@internal*/
    export type DocumentInsertedListener = () => void;

    /**@internal*/
    export type ScriptsLoadedListener = () => void;

    /**@internal*/
    export interface AjaxEventMap
    {
        "documentfetched": DocumentFetchedListener;
        "documentinserted": DocumentInsertedListener;
        "scriptsloaded": ScriptsLoadedListener;
    }
}