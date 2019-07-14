namespace Kurz
{
    /**
     * @internal
     * Manages all event-related aspects of AJAX, including updating history.
     */
    export class _AjaxEventManager
    {
        private _managingContext: AjaxContext;
        private _documentFetchedListeners: DocumentFetchedListener[];
        private _documentInsertedListeners: DocumentInsertedListener[];
        private _scriptsLoadedListeners: ScriptsLoadedListener[];

        constructor(managingContext: AjaxContext, historyManager: HistoryManager)
        {
            this._managingContext = managingContext;

            this._documentFetchedListeners = [];
            this._documentInsertedListeners = [];
            this._scriptsLoadedListeners = [];

            historyManager.addPopStateListener(this._onHistoryPopState.bind(this));
        }

        _addEventListener<T extends keyof AjaxEventMap>(type: T, callback: AjaxEventMap[T])
        {
            switch (type)
            {
            case "documentfetched":
                this._addNewEventListener(this._documentFetchedListeners, callback);
                break;
            case "documentinserted":
                this._addNewEventListener(this._documentInsertedListeners, callback);
                break;
            case "scriptsloaded":
                this._addNewEventListener(this._scriptsLoadedListeners, callback);
                break;
            }
        }

        _invokeDocumentFetchedListeners(fetchedDocument: Document)
        {
            for (const documentFetchedListener of this._documentFetchedListeners)
            {
                documentFetchedListener(fetchedDocument);
            }
        }

        _invokeDocumentInsertedListeners()
        {
            for (const documentInsertedListener of this._documentInsertedListeners)
            {
                documentInsertedListener();
            }
        }

        _invokeScriptsLoadedListeners()
        {
            for (const scriptsLoadedListener of this._scriptsLoadedListeners)
            {
                scriptsLoadedListener();
            }
        }

        private _addNewEventListener<T>(listeners: T[], listener: T)
        {
            if (listeners.indexOf(listener) === -1)
            {
                listeners.push(listener);
            }
        }

        private async _onHistoryPopState(historyState: Readonly<HistoryState>)
        {
            if (historyState.url == undefined)
            {
                return;
            }

            const url = historyState.url;
            const targetSelector = historyState.ajaxTargetSelector;

            this._managingContext.navigateTo(url, targetSelector, undefined, false);
        }
    }
}