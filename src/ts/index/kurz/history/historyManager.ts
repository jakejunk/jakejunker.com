namespace Kurz
{
    type PopStateListener = (historyState: Readonly<HistoryState>) => void;

    export class HistoryManager
    {
        private static _Instance?: HistoryManager;

        private _popStateListeners: PopStateListener[];

        private constructor()
        {
            this._popStateListeners = [];

            window.addEventListener("popstate", this._onPopState.bind(this));
        }

        static GetInstance(): Result<HistoryManager, string>
        {
            if (HistoryManager._Instance == undefined)
            {
                const hasHistory = "history" in window;
                if (!hasHistory)
                {
                    return Result.OfError("The History API is not supported.");
                }

                const hasPushState = "pushState" in window.history;
                if (!hasPushState)
                {
                    return Result.OfError("The pushState() function is not supported.");
                }

                HistoryManager._Instance = new HistoryManager();
            }
            
            return Result.OfOk(HistoryManager._Instance);
        }

        pushState(state: HistoryState)
        {
            history.replaceState(state.ajaxTargetSelector, "", null);
            history.pushState(state.ajaxTargetSelector, "", state.url);
        }

        replaceState(state: HistoryState)
        {
            history.replaceState(state.ajaxTargetSelector, "", null);
        }

        addPopStateListener(popStateListener: PopStateListener)
        {
            if (this._popStateListeners.indexOf(popStateListener) === -1)
            {
                this._popStateListeners.push(popStateListener);
            }
        }

        removePopStateListeners(popStateListener: PopStateListener)
        {
            this._popStateListeners = this._popStateListeners
                .filter(listener => listener !== popStateListener);
        }

        private _onPopState(ev: PopStateEvent)
        {
            const url = location.pathname + location.hash;
            const ajaxTargetSelector = ev.state as string;
            const historyState: HistoryState = { url: url, ajaxTargetSelector: ajaxTargetSelector }

            for (const listener of this._popStateListeners)
            {
                listener(historyState);
            }
        }
    }
}