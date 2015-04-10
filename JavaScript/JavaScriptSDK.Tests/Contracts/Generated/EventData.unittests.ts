// THIS FILE WAS AUTOGENERATED
/// <reference path="../../External/qunit.d.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/DataPoint.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/MetricData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/RemoteDependencyData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/RequestData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/StackFrame.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/ExceptionDetails.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/ExceptionData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/MessageData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/EventData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/PageViewData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/PageViewPerfData.ts" />
/// <reference path="../../../JavaScriptSDK/Contracts/Generated/AjaxCallData.ts" />
QUnit.test("Test property EventData.ver was created and default is set", function () {
    var temp = new AI.EventData();
    QUnit.ok(temp.ver !== null, "EventData.ver == null");
    QUnit.ok(temp.ver === 2, "Issue with EventData.ver");
});

QUnit.test("Test property EventData.name was created and default is set", function () {
    var temp = new AI.EventData();
    QUnit.ok(temp.name !== null, "EventData.name == null");
});

QUnit.test("Test property EventData.properties was created and default is set", function () {
    var temp = new AI.EventData();
    QUnit.ok(temp.properties !== null, "EventData.properties == null");
});

QUnit.test("Test property EventData.measurements was created and default is set", function () {
    var temp = new AI.EventData();
    QUnit.ok(temp.measurements !== null, "EventData.measurements == null");
});

