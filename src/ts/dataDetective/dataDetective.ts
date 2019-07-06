/**
 * Called when either:
 * 1. After the page first loads (normally), after the DOM finishes loading
 * 2. After the script is injected (Ajax)
 */
function OnFragmentLoad()
{
    DataDetective.Init();
}


namespace DataDetective
{
    export function Init()
    {
        let fields = document.getElementsByClassName("_dd-client-calc") as HTMLCollectionOf<HTMLElement>;

        for (let field of fields)
        {
            let fn = _functions[field.dataset.calcType as string] as () => string | undefined;

            let result: string | undefined = undefined;
            if (typeof fn === "function")
            {
                result = fn();
            }

            if (result != undefined)
            {
                field.innerText = result;
            }
            else
            {
                field.innerText = "Unknown";
                field.classList.add("whisper");
            }
        }
    }


// Private ========================================================================================

    
    let _functions: any = {

        /**
         * Gets the client's operating system.
         * TODO: Does not return any version information.
         */
        os: () => {
            
            let retval = undefined;
            let userAgent = navigator.userAgent;
            let platform  = navigator.platform;
            let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
            let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
            let iosPlatforms = ['iPhone', 'iPad', 'iPod'];

            if (windowsPlatforms.indexOf(platform) !== -1)
            {
                retval = "Windows";
            }
            else if (macosPlatforms.indexOf(platform) !== -1)
            {
                retval = "Macintosh";
            }
            else if (iosPlatforms.indexOf(platform) !== -1)
            {
                retval = "iOS";
            }
            else if (/Android/.test(userAgent))
            {
                retval = "Android";
            }
            else if (/Linux/.test(userAgent))
            {
                retval = "Linux";
            }

            return retval;
        },


        /**
         * Gets the total RAM on the system.
         */
        ram: () => {
            
            let ram = (navigator as any).deviceMemory as number;
            return ram != undefined ? ram + " GB" : undefined;
        },


        logicalProcessors: () => {

            return navigator.hardwareConcurrency;
        },


        /**
         * 
         */
        resolution: () => {

            let dpr = devicePixelRatio;
            let w = screen.width * dpr;
            let h = screen.height * dpr;

            return w + " x " + h;
        },


        /**
         * 
         */
        colorDepth: () => {

            return screen.colorDepth + " bits/pixel";
        },


        /**
         * Gets whether Flash is installed.
         * TODO: Maybe get version information?
         */
        isFlashInstalled: () => {

            try
            {
                let axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (axo)
                {
                    return "Installed";
                }
            }
            catch (e)
            {
                let mimeTypes = navigator.mimeTypes as any;

                if (mimeTypes &&
                    mimeTypes['application/x-shockwave-flash'] !== undefined &&
                    mimeTypes['application/x-shockwave-flash'].enabledPlugin)
                {
                    return "Installed";
                }
            }

            return undefined;
        },


        /**
         * 
         */
        isJavaInstalled: () => {

            if (navigator.javaEnabled())
            {
                return "Installed";
            }

            return undefined;
        },


        getLocalIP: () => {

            
        }
    };
}