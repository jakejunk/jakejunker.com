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
        private _eventManager: _AjaxEventManager;
        private _loadingIndicator?: [HTMLElement, string];
        private _transitionInClassName?: string;
        private _transitionOutClassName?: string;

        private constructor(
            readonly ajaxClient: AjaxClient,
            readonly documentParser: AjaxDocumentParser,
            readonly historyManager: HistoryManager)
        {
            this._eventManager = new _AjaxEventManager(this, historyManager);
        }

        /**
         * Creates a new `AjaxContext`, which can be used to implement "unobtrusive" AJAX functionality.
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
            this._eventManager._addEventListener(type, callback);
        }

        setLoadingIndicator(selector: string, className: string): Result<undefined, string>
        {
            const loadingElement = document.querySelector<HTMLElement>(selector);
            if (loadingElement == undefined)
            {
                return Result.OfError(`Element with selector ${selector} not found`);
            }

            this._loadingIndicator = [loadingElement, className];

            return Result.OfOk(undefined);
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
            this._toggleTransition(targetSelector);
            this._toggleLoading();

            const responseResult = await this._performFetch(url, targetSelector, postBody);
            if (responseResult.isError())
            {
                // TODO: Use an alert or something
                console.error(responseResult.errorValue);

                this._toggleTransition(targetSelector);
                this._toggleLoading();

                return;
            }

            const handleResponseResult = await this._handleResponse(responseResult.okValue, targetSelector);
            if (handleResponseResult.isError())
            {
                console.error(handleResponseResult.errorValue);
                return;
            }
            
            if (updateHistory)
            {
                this.historyManager.pushState({url: url, ajaxTargetSelector: targetSelector});
            }

            this.refreshContext();

            await handleResponseResult.okValue;
            
            this._toggleLoading();
            this._eventManager._invokeScriptsLoadedListeners();
        }

        private _toggleTransition(targetSelector: string)
        {
            if (this._transitionOutClassName != undefined)
            {
                const oldElement = document.querySelector(targetSelector);
                if (oldElement != undefined)
                {
                    oldElement.classList.toggle(this._transitionOutClassName);
                }
            }
        }

        private _toggleLoading()
        {
            if (this._loadingIndicator != undefined)
            {
                const element = this._loadingIndicator[0];
                const className = this._loadingIndicator[1];

                element.classList.toggle(className);
            }
        }

        private async _performFetch(url: string, targetSelector: string, postBody?: FormData): Promise<Result<Response, string>>
        {
            let response: Response;

            try
            {
                response = postBody ?
                    await this.ajaxClient.post(url, postBody) :
                    await this.ajaxClient.get(url);
            }
            catch (e)
            {
                return Result.OfError("TODO: Display error code alert.");
            }

            // TODO: Handle non 200 return codes

            return Result.OfOk(response);
        }

        private async _handleResponse(response: Response, targetSelector: string): Promise<Result<Promise<{}>, string>>
        {
            const fetchedDocument = await this.documentParser.parseFromResponse(response);
            this._eventManager._invokeDocumentFetchedListeners(fetchedDocument);

            const insertResult = this.documentParser.insertIntoDocument(fetchedDocument, targetSelector, this._transitionInClassName);
            if (insertResult.isError())
            {
                return Result.OfError(insertResult.errorValue);
            }
            
            this._eventManager._invokeDocumentInsertedListeners();

            return Result.OfOk(insertResult.okValue);
        }
    }
}