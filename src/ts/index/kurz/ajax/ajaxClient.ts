namespace Kurz
{
    type PostBody = string
        | Blob
        | ArrayBufferView
        | ArrayBuffer
        | FormData
        | URLSearchParams
        | ReadableStream<Uint8Array>
        | null;

    export class AjaxClient
    {
        onProgress?: (loaded: number, total: number) => void;
        readonly headers: Headers;
        private abortController: AbortController;

        private constructor()
        {
            this.headers = new Headers();
            this.abortController = new AbortController();
        }

        static Create(): Result<AjaxClient, string>
        {
            const hasFetch = "fetch" in window;
            if (!hasFetch)
            {
                return Result.OfError("The Fetch API is not supported.");
            }

            return Result.OfOk(new AjaxClient());
        }

        async get(url: string): Promise<Response>
        {
            return this._makeRequest("GET", url);
        }

        async post(url: string, body?: PostBody): Promise<Response>
        {
            return this._makeRequest("POST", url, body);
        }

        abortCurrentRequests()
        {
            this.abortController.abort();
        }

        private async _makeRequest(method: string, url: string, body?: PostBody): Promise<Response>
        {
            const requestParams: RequestInit = {
                body: body,
                headers: this.headers,
                method: method,
                signal: this.abortController.signal
            };

            return fetch(url, requestParams);
        }
    }
}