import { IConfig, PageViewPerformance, SeverityLevel, Util, IPageViewPerformanceTelemetry, 
    IPageViewTelemetry, ITraceTelemetry, IMetricTelemetry, 
    IAutoExceptionTelemetry, IDependencyTelemetry, IExceptionTelemetry, IEventTelemetry } from "@microsoft/applicationinsights-common";
import { ITelemetryContext } from "@microsoft/applicationinsights-properties-js/types/Interfaces/ITelemetryContext";
import { Snippet, IApplicationInsights } from "./Initialization";

// ToDo: fix properties and measurements once updates are done to common
export class AppInsightsDeprecated implements IAppInsightsDeprecated {
    public config: IConfig;
    public snippet: Snippet;
    public context: ITelemetryContext;
    queue: (() => void)[];
    private appInsightsNew: IApplicationInsights;

    constructor(snippet: Snippet, appInsightsNew: IApplicationInsights) {
        this.config = AppInsightsDeprecated.getDefaultConfig(snippet.config);
        this.appInsightsNew = appInsightsNew;
    }

    startTrackPage(name?: string) {
        this.appInsightsNew.startTrackPage(name);
    }

    stopTrackPage(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        this.appInsightsNew.stopTrackPage(name, url, properties); // update
    }

    trackPageView(name?: string, url?: string, properties?: Object, measurements?: Object, duration?: number) {
        let telemetry: IPageViewTelemetry = {
            name: name,
            uri: url
        };

        // fix for props, measurements, duration
        this.appInsightsNew.trackPageView(telemetry);
    }

    trackEvent(name: string, properties?: Object, measurements?: Object) {
        this.appInsightsNew.trackEvent(<IEventTelemetry>{ name: name});
    }
    trackDependency(id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number) {
        this.appInsightsNew.trackDependencyData(
            <IDependencyTelemetry>{ 
                id: id, 
                absoluteUrl: absoluteUrl, 
                commandName: pathName, 
                duration: totalTime,
                method: method, 
                success: success, 
                resultCode: resultCode
            });
    }

    trackException(exception: Error, handledAt?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, severityLevel?: any) {
        this.appInsightsNew.trackException(<IExceptionTelemetry>{
            error: exception
        });
    }

    trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; }) {
        this.appInsightsNew.trackMetric(<IMetricTelemetry>{name: name, average: average, sampleCount: sampleCount, min: min, max: max});
    }

    trackTrace(message: string, properties?: { [name: string]: string; }, severityLevel?: any) {
        this.appInsightsNew.trackTrace(<ITraceTelemetry>{ message: message, severityLevel: severityLevel });
    }

    flush(async?: boolean) {
        this.appInsightsNew.flush(async);
    }

    setAuthenticatedUserContext(authenticatedUserId: string, accountId?: string, storeInCookie?: boolean) {
        this.appInsightsNew.setAuthenticatedUserContext(authenticatedUserId, accountId, storeInCookie);
    }

    clearAuthenticatedUserContext() {
        this.appInsightsNew.clearAuthenticatedUserContext();
    }
    
    _onerror(message: string, url: string, lineNumber: number, columnNumber: number, error: Error) {
        this.appInsightsNew._onerror(<IAutoExceptionTelemetry>{ message: message, url: url, lineNumber: lineNumber, columnNumber: columnNumber, error: error });
    }
    
    
    startTrackEvent(name: string) {
        throw new Error("Method not implemented.");
    }

    stopTrackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        throw new Error("Method not implemented.");
    }

    downloadAndSetup?(config: IConfig): void {
        throw new Error("downloadAndSetup not implemented in web SKU");
    }

    // note: these are split into methods to enable unit tests
    public loadAppInsights() {

        // initialize global instance of appInsights
        //var appInsights = new Microsoft.ApplicationInsights.AppInsights(this.config);

        // implement legacy version of trackPageView for 0.10<
        if (this.config["iKey"]) {
            var originalTrackPageView = this.trackPageView;
            this.trackPageView = (pagePath?: string, properties?: Object, measurements?: Object) => {
                originalTrackPageView.apply(this, [null, pagePath, properties, measurements]);
            }
        }

        // implement legacy pageView interface if it is present in the snippet
        var legacyPageView = "logPageView";
        if (typeof this.snippet[legacyPageView] === "function") {
            this[legacyPageView] = (pagePath?: string, properties?: Object, measurements?: Object) => {
                this.trackPageView(null, pagePath, properties, measurements);
            }
        }

        // implement legacy event interface if it is present in the snippet
        var legacyEvent = "logEvent";
        if (typeof this.snippet[legacyEvent] === "function") {
            this[legacyEvent] = (name: string, props?: Object, measurements?: Object) => {
                this.trackEvent(name, props, measurements);
            }
        }

        return this;
    }

    private static getDefaultConfig(config?: any): any {
        if (!config) {
            config = <any>{};
        }

        // set default values
        config.endpointUrl = config.endpointUrl || "https://dc.services.visualstudio.com/v2/track";
        config.sessionRenewalMs = 30 * 60 * 1000;
        config.sessionExpirationMs = 24 * 60 * 60 * 1000;
        config.maxBatchSizeInBytes = config.maxBatchSizeInBytes > 0 ? config.maxBatchSizeInBytes : 102400; // 100kb
        config.maxBatchInterval = !isNaN(config.maxBatchInterval) ? config.maxBatchInterval : 15000;
        config.enableDebug = Util.stringToBoolOrDefault(config.enableDebug);
        config.disableExceptionTracking = Util.stringToBoolOrDefault(config.disableExceptionTracking);
        config.disableTelemetry = Util.stringToBoolOrDefault(config.disableTelemetry);
        config.verboseLogging = Util.stringToBoolOrDefault(config.verboseLogging);
        config.emitLineDelimitedJson = Util.stringToBoolOrDefault(config.emitLineDelimitedJson);
        config.diagnosticLogInterval = config.diagnosticLogInterval || 10000;
        config.autoTrackPageVisitTime = Util.stringToBoolOrDefault(config.autoTrackPageVisitTime);

        if (isNaN(config.samplingPercentage) || config.samplingPercentage <= 0 || config.samplingPercentage >= 100) {
            config.samplingPercentage = 100;
        }

        config.disableAjaxTracking = Util.stringToBoolOrDefault(config.disableAjaxTracking);
        config.maxAjaxCallsPerView = !isNaN(config.maxAjaxCallsPerView) ? config.maxAjaxCallsPerView : 500;
      
        config.isBeaconApiDisabled = Util.stringToBoolOrDefault(config.isBeaconApiDisabled, true);
        config.disableCorrelationHeaders = Util.stringToBoolOrDefault(config.disableCorrelationHeaders);
        config.correlationHeaderExcludedDomains = config.correlationHeaderExcludedDomains || [
            "*.blob.core.windows.net", 
            "*.blob.core.chinacloudapi.cn",
            "*.blob.core.cloudapi.de",
            "*.blob.core.usgovcloudapi.net"];
        config.disableFlushOnBeforeUnload = Util.stringToBoolOrDefault(config.disableFlushOnBeforeUnload);
        config.enableSessionStorageBuffer = Util.stringToBoolOrDefault(config.enableSessionStorageBuffer, true);
        config.isRetryDisabled = Util.stringToBoolOrDefault(config.isRetryDisabled);
        config.isCookieUseDisabled = Util.stringToBoolOrDefault(config.isCookieUseDisabled);
        config.isStorageUseDisabled = Util.stringToBoolOrDefault(config.isStorageUseDisabled);
        config.isBrowserLinkTrackingEnabled = Util.stringToBoolOrDefault(config.isBrowserLinkTrackingEnabled);
        config.enableCorsCorrelation = Util.stringToBoolOrDefault(config.enableCorsCorrelation);

        return config;
    }
}

export interface IAppInsightsDeprecated {

    /*
    * Config object used to initialize AppInsights
    */
    config: IConfig;

    context: ITelemetryContext;

    /*
    * Initialization queue. Contains functions to run when appInsights initializes
    */
    queue: Array<() => void>;

    /**
    * Starts timing how long the user views a page or other item. Call this when the page opens.
    * This method doesn't send any telemetry. Call `stopTrackPage` to log the page when it closes.
    * @param   name  A string that idenfities this item, unique within this HTML document. Defaults to the document title.
    */
    startTrackPage(name?: string);

    /**
    * Logs how long a page or other item was visible, after `startTrackPage`. Call this when the page closes.
    * @param   name  The string you used as the name in startTrackPage. Defaults to the document title.
    * @param   url   String - a relative or absolute URL that identifies the page or other item. Defaults to the window location.
    * @param   properties  map[string, string] - additional data used to filter pages and metrics in the portal. Defaults to empty.
    * @param   measurements    map[string, number] - metrics associated with this page, displayed in Metrics Explorer on the portal. Defaults to empty.
    * @deprecated API is deprecated; supported only if input configuration specifies deprecated=true
    */
    stopTrackPage(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; });

    /**
     * Logs that a page or other item was viewed.
     * @param   name  The string you used as the name in `startTrackPage`. Defaults to the document title.
     * @param   url   String - a relative or absolute URL that identifies the page or other item. Defaults to the window location.
     * @param   properties  map[string, string] - additional data used to filter pages and metrics in the portal. Defaults to empty.
     * @param   measurements    map[string, number] - metrics associated with this page, displayed in Metrics Explorer on the portal. Defaults to empty.
     * @param   duration    number - the number of milliseconds it took to load the page. Defaults to undefined. If set to default value, page load time is calculated internally.
     */
    trackPageView(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, duration?: number);

    /**
     * Start timing an extended event. Call `stopTrackEvent` to log the event when it ends.
     * @param   name    A string that identifies this event uniquely within the document.
     */
    startTrackEvent(name: string);


    /**
     * Log an extended event that you started timing with `startTrackEvent`.
     * @param   name    The string you used to identify this event in `startTrackEvent`.
     * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
     * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
     */
    stopTrackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; });

    /**
    * Log a user action or other occurrence.
    * @param   name    A string to identify this event in the portal.
    * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
    * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
    */
    trackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; });

    /**
     * Log a dependency call
     * @param id    unique id, this is used by the backend o correlate server requests. Use Util.newId() to generate a unique Id.
     * @param method    represents request verb (GET, POST, etc.)
     * @param absoluteUrl   absolute url used to make the dependency request
     * @param pathName  the path part of the absolute url
     * @param totalTime total request time
     * @param success   indicates if the request was sessessful
     * @param resultCode    response code returned by the dependency request
     */
    trackDependency(id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number);

    /**
     * Log an exception you have caught.
     * @param   exception   An Error from a catch clause, or the string error message.
     * @param   handledAt   Not used
     * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
     * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
     * @param   severityLevel   SeverityLevel - severity level
     */
    trackException(exception: Error, handledAt?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, severityLevel?: SeverityLevel);

    /**
     * Log a numeric value that is not associated with a specific event. Typically used to send regular reports of performance indicators.
     * To send a single measurement, use just the first two parameters. If you take measurements very frequently, you can reduce the
     * telemetry bandwidth by aggregating multiple measurements and sending the resulting average at intervals.
     * @param   name    A string that identifies the metric.
     * @param   average Number representing either a single measurement, or the average of several measurements.
     * @param   sampleCount The number of measurements represented by the average. Defaults to 1.
     * @param   min The smallest measurement in the sample. Defaults to the average.
     * @param   max The largest measurement in the sample. Defaults to the average.
     */
    trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; });

    /**
    * Log a diagnostic message.
    * @param   message A message string
    * @param   properties  map[string, string] - additional data used to filter traces in the portal. Defaults to empty.
    * @param   severityLevel   SeverityLevel - severity level
    */
    trackTrace(message: string, properties?: { [name: string]: string; }, severityLevel?: SeverityLevel);


    /**
     * Immediately send all queued telemetry.
     * @param {boolean} async - If flush should be call asynchronously
     */
    flush(async?: boolean);


    /**
    * Sets the autheticated user id and the account id in this session.
    * User auth id and account id should be of type string. They should not contain commas, semi-colons, equal signs, spaces, or vertical-bars.
    *
    * @param authenticatedUserId {string} - The authenticated user id. A unique and persistent string that represents each authenticated user in the service.
    * @param accountId {string} - An optional string to represent the account associated with the authenticated user.
    */
    setAuthenticatedUserContext(authenticatedUserId: string, accountId?: string, storeInCookie?: boolean);


    /**
     * Clears the authenticated user id and the account id from the user context.
     */
    clearAuthenticatedUserContext();

    /*
    * Downloads and initializes AppInsights. You can override default script download location by specifying url property of `config`.
    */
    downloadAndSetup?(config: IConfig): void;

    /**
     * The custom error handler for Application Insights
     * @param {string} message - The error message
     * @param {string} url - The url where the error was raised
     * @param {number} lineNumber - The line number where the error was raised
     * @param {number} columnNumber - The column number for the line where the error was raised
     * @param {Error}  error - The Error object
     */
    _onerror(message: string, url: string, lineNumber: number, columnNumber: number, error: Error);
}