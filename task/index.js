"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var tl = require("azure-pipelines-task-lib/task");
var child_process_1 = require("child_process");
var publishTypeValues = {
    None: 0,
    Beta: 1,
    Live: 2
};
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, entProfileId, appPath, summary, releaseNotes, publishType, inputs_1;
        return __generator(this, function (_a) {
            try {
                accessToken = tl.getInputRequired("accessToken");
                entProfileId = tl.getInputRequired("entProfileId");
                appPath = tl.getInputRequired("appPath");
                summary = tl.getInputRequired("summary");
                releaseNotes = tl.getInputRequired("releaseNotes");
                publishType = tl.getInputRequired("publishType");
                console.log("access token:", accessToken);
                console.log("entProfileId:", entProfileId);
                console.log("summary:", summary);
                console.log("releaseNotes:", releaseNotes);
                console.log("Converted publishType:", publishTypeValues[publishType]);
                inputs_1 = {
                    accessToken: isVariableName(accessToken)
                        ? tl.getVariable(accessToken)
                        : accessToken,
                    entProfileId: isVariableName(entProfileId)
                        ? tl.getVariable(entProfileId)
                        : entProfileId,
                    appPath: isVariableName(appPath) ? tl.getVariable(appPath) : appPath,
                    summary: isVariableName(summary) ? tl.getVariable(summary) : summary,
                    releaseNotes: isVariableName(releaseNotes)
                        ? tl.getVariable(releaseNotes)
                        : releaseNotes,
                    publishType: publishTypeValues[publishType]
                };
                installACNpmPackage(function () {
                    appcircleLogin(inputs_1.accessToken, function () {
                        uploadForProfile(inputs_1.entProfileId, inputs_1.appPath, function () {
                            getStoreVersionList(inputs_1.entProfileId, function (appVersionId) {
                                console.log("app version id:", appVersionId);
                                publishToAppStore(inputs_1.entProfileId, appVersionId, inputs_1.summary, inputs_1.releaseNotes, inputs_1.publishType, function () {
                                    tl.setResult(tl.TaskResult.Succeeded, "App published successfully");
                                });
                            });
                        });
                    });
                });
                tl.setResult(tl.TaskResult.Succeeded, "Artifact Published Successfully!");
            }
            catch (err) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
            return [2 /*return*/];
        });
    });
}
run();
function installACNpmPackage(callback) {
    (0, child_process_1.exec)("npm install -g @appcircle/cli", function (error) {
        if (error) {
            tl.setResult(tl.TaskResult.Failed, error.message);
            return;
        }
        callback();
    });
}
function appcircleLogin(accessToken, callback) {
    (0, child_process_1.exec)("appcircle login --pat=".concat(accessToken), function (error) {
        if (error) {
            tl.setResult(tl.TaskResult.Failed, error.message);
            return;
        }
        callback();
    });
}
function uploadForProfile(profileId, app, callback) {
    var command = "appcircle enterprise-app-store version upload-for-profile --entProfileId ".concat(profileId, " --app ").concat(app);
    try {
        (0, child_process_1.execSync)(command, { encoding: "utf-8" });
        callback();
    }
    catch (error) {
        tl.setResult(tl.TaskResult.Failed, error);
    }
}
function publishToAppStore(entProfileId, entVersionId, summary, releaseNote, publishType, callback) {
    var command = "appcircle enterprise-app-store version publish --entProfileId ".concat(entProfileId, " --entVersionId ").concat(entVersionId, " --summary \"").concat(summary, "\" --releaseNotes \"").concat(releaseNote, "\" --publishType ").concat(publishType);
    try {
        var output = (0, child_process_1.execSync)(command, { encoding: "utf-8" });
        tl.setResult(tl.TaskResult.Succeeded, "App Published Successfully!");
        callback();
    }
    catch (error) {
        tl.setResult(tl.TaskResult.Failed, error);
    }
}
function getStoreVersionList(entProfileId, callback) {
    var _a;
    var command = "appcircle enterprise-app-store version list --entProfileId ".concat(entProfileId, "  -o json");
    try {
        var output = (0, child_process_1.execSync)(command, { encoding: "utf-8" });
        var list = JSON.parse(output);
        console.log("store version list:", list);
        callback((_a = list === null || list === void 0 ? void 0 : list[0]) === null || _a === void 0 ? void 0 : _a.id);
    }
    catch (error) {
        tl.setResult(tl.TaskResult.Failed, error);
    }
}
function isVariableName(input) {
    var variablePrefix = "$(";
    var variableSuffix = ")";
    if (input.startsWith(variablePrefix) && input.endsWith(variableSuffix)) {
        return true;
    }
    return false;
}
