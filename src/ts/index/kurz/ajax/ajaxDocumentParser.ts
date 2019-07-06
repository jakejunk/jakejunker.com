namespace Kurz
{
    export class AjaxDocumentParser
    {
        private _docParser: DOMParser;
        private _replacementBehavior: InsertionBehavior;

        private constructor(replacementBehavior: InsertionBehavior)
        {
            this._docParser = new DOMParser();
            this._replacementBehavior = replacementBehavior;
        }

        static Create(replacementBehavior?: InsertionBehavior): AjaxDocumentParser
        {
            return new AjaxDocumentParser(replacementBehavior || InsertionBehavior.REPLACE);
        }
        
        async parseFromResponse(response: Response): Promise<Document>
        {
            const responseText = await response.text();

            return this._docParser.parseFromString(responseText, "text/html");
        }
        
        /**
         * Uses the target element selector to move an element from the `fetchedDocument` to the `targetDocument`.
         * TODO: `<noscript>` elements will be completely stripped out.
         */
        insertIntoCurrentDocument(fetchedDocument: Document, targetSelector: string, transitionClass?: string): Result<Promise<{}>, string>
        {
            const targetElement = document.querySelector<HTMLElement>(targetSelector);
            if (targetElement == undefined)
            {
                return Result.OfError(`Element matching "${targetSelector}" does not exist in the current document.`);
            }
            
            const replacementElement = fetchedDocument.querySelector<HTMLElement>(targetSelector) || fetchedDocument.body;

            if (transitionClass != undefined)
            {
                replacementElement.classList.add(transitionClass);
                targetElement.replaceWith(replacementElement);

                ForceReflow();
                
                replacementElement.classList.remove(transitionClass);
            }
            else
            {
                targetElement.replaceWith(replacementElement);
            }

            const scriptLoadPromise = this._refreshScriptElements(replacementElement);

            return Result.OfOk(scriptLoadPromise);
        }
        
        private _refreshScriptElements(fetchedElement: HTMLElement): Promise<{}>
        {
            const scriptLoadPromises: Promise<{}>[] = [];
            const externalScripts = QuerySelectorAll("script", "[src]", fetchedElement);

            for (const scriptToReplace of externalScripts)
            {
                const newScript = this._cloneScriptElement(scriptToReplace);

                scriptLoadPromises.push(new Promise(resolve => {
                    newScript.onload = resolve;
                }));

                scriptToReplace.replaceWith(newScript);
            }

            return Promise.all(scriptLoadPromises);
        }

        private _cloneScriptElement(oldScriptElement: HTMLScriptElement): HTMLScriptElement
        {
            const newScript = document.createElement("script");
            for (const attribute of oldScriptElement.attributes)
            {
                newScript.setAttribute(attribute.name, attribute.value);
            }

            return newScript;
        }
    }
}