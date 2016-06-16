﻿/// <reference path="../../JavaScriptSDK.Interfaces/Context/IApplication.ts" />

module Microsoft.ApplicationInsights.Context {

    "use strict";

    export class Application implements IApplication {
        /**
         * The application version.
         */
        public ver: string;

        /**
         * The application build version.
         */
        public build: string;
    }
}