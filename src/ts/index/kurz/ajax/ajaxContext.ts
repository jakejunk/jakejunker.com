namespace Kurz
{
    /**
     * Encapsulates the multiple stages of SPA-style AJAX into one context.
     * These stages are:
     *   1. Fetching the remote page.
     *   2. Parsing the returned page and placing the desired portion into the current document.
     *   3. Updating the browser's history to reflect this navigation.
     */
    export class AjaxContext
    {
        private _eventManager: AjaxEventManager;
        private _transitionInClassName?: string;
        private _transitionOutClassName?: string;

        private constructor(
            readonly ajaxClient: AjaxClient,
            readonly documentParser: AjaxDocumentParser,
            readonly historyManager: HistoryManager)
        {
            this._eventManager = new AjaxEventManager(this, historyManager);
        }

        /**
         * Creates a new `AjaxContext`, which can be used to implement
         * "unobtrusive" AJAX functionality.
         */
        static Create(): Result<AjaxContext, string>
        {
            const ajaxClientResult = AjaxClient.Create();
            if (ajaxClientResult.isError())
            {
                return Result.OfError(ajaxClientResult.errorValue);
            }

            const historyManagerResult = HistoryManager.GetInstance();
            if (historyManagerResult.isError())
            {
                return Result.OfError(historyManagerResult.errorValue);
            }
            
            const ajaxClient = ajaxClientResult.okValue;
            const documentParser = AjaxDocumentParser.Create();
            const historyManager = historyManagerResult.okValue;

            return Result.OfOk(new AjaxContext(ajaxClient, documentParser, historyManager));
        }

        /**
         * Tells this context to gather and initialize all ajax-enabled elements on the page.
         */
        refreshContext()
        {
            HTMLAjaxLinkElement.InitializeAll(this);
            HTMLAjaxFormElement.InitializeAll(this);
        }

        addEventListener<T extends keyof AjaxEventMap>(type: T, callback: AjaxEventMap[T])
        {
            this._eventManager.addEventListener(type, callback);
        }

        /**
         * Customizes the AJAX transition of fetched content by applying the specified class.
         */
        setTransitionInClass(className: string)
        {
            this._transitionInClassName = className;
        }

        /**
         * Customizes the AJAX transition of old content by applying the specified class.
         */
        setTransitionOutClass(className: string)
        {
            this._transitionOutClassName = className;
        }

        /**
         * Navigates to a new URL, using the target selector to designate which element should be updated.
         * If `postBody` is provided, a POST request is performed instead of a GET request.
         */
        async navigateTo(url: string, targetSelector: string, postBody?: FormData, updateHistory = true): Promise<void>
        {
            if (this._transitionOutClassName != undefined)
            {
                const oldElement = document.querySelector(targetSelector);
                if (oldElement != undefined)
                {
                    oldElement.classList.add(this._transitionOutClassName);
                }
            }

            const response = postBody ?
                await this.ajaxClient.post(url, postBody) :
                await this.ajaxClient.get(url);

            const fetchedDocument = await this.documentParser.parseFromResponse(response);
            this._eventManager.invokeDocumentFetchedListeners(fetchedDocument);

            const insertResult = this.documentParser.insertIntoCurrentDocument(fetchedDocument, targetSelector, this._transitionInClassName);
            if (insertResult.isError())
            {
                console.log(insertResult.errorValue);
                return;
            }
            
            this._eventManager.invokeDocumentInsertedListeners();
            const scriptsLoadedPromise = insertResult.okValue;

            if (updateHistory)
            {
                this.historyManager.pushState({url: url, ajaxTargetSelector: targetSelector});
            }

            this.refreshContext();

            await scriptsLoadedPromise;
            this._eventManager.invokeScriptsLoadedListeners();
        }
    }
}