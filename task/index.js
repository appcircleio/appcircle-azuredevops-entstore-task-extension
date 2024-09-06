"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getEnterpriseAppVersions = exports.checkTaskStatus = exports.getProfileId = exports.publishEnterpriseAppVersion = exports.uploadEnterpriseApp = exports.getEnterpriseProfiles = exports.appcircleApi = exports.UploadServiceHeaders = exports.getToken = void 0;
var tl = require("azure-pipelines-task-lib/task");
var axios_1 = require("axios");
var fs = require("fs");
var FormData = require("form-data");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var personalAPIToken, appPath, summary, releaseNotes, _publishType, publishType, validExtensions, fileExtension, loginResponse, uploadResponse, status_1, profileId, appVersions, entVersionId, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    personalAPIToken = tl.getInputRequired("personalAPIToken");
                    appPath = tl.getInputRequired("appPath");
                    summary = tl.getInputRequired("summary");
                    releaseNotes = tl.getInputRequired("releaseNotes");
                    _publishType = tl.getInputRequired("publishType");
                    publishType = "0";
                    validExtensions = [".apk", ".ipa"];
                    fileExtension = appPath.slice(appPath.lastIndexOf(".")).toLowerCase();
                    if (!validExtensions.includes(fileExtension)) {
                        tl.setResult(tl.TaskResult.Failed, "Invalid file extension: ".concat(appPath, ". For Android, use .apk. For iOS, use .ipa."));
                        return [2 /*return*/];
                    }
                    if (_publishType !== "None" &&
                        _publishType !== "Beta" &&
                        _publishType !== "Live") {
                        tl.setResult(tl.TaskResult.Failed, "Invalid publish type: ".concat(_publishType, ". Please use \"None\", \"Beta\" or \"Live\"."));
                        return [2 /*return*/];
                    }
                    switch (_publishType) {
                        case "None":
                            publishType = "0";
                            break;
                        case "Beta":
                            publishType = "1";
                            break;
                        case "Live":
                            publishType = "2";
                            break;
                        default:
                            break;
                    }
                    return [4 /*yield*/, getToken(personalAPIToken)];
                case 1:
                    loginResponse = _a.sent();
                    UploadServiceHeaders.token = loginResponse.access_token;
                    console.log("Logged in to Appcircle successfully");
                    return [4 /*yield*/, uploadEnterpriseApp(appPath)];
                case 2:
                    uploadResponse = _a.sent();
                    return [4 /*yield*/, checkTaskStatus(uploadResponse.taskId)];
                case 3:
                    status_1 = _a.sent();
                    if (!status_1) {
                        tl.setResult(tl.TaskResult.Failed, "".concat(uploadResponse.taskId, " id upload request failed with status Cancelled"));
                        return [2 /*return*/];
                    }
                    if (!(publishType !== "0")) return [3 /*break*/, 7];
                    return [4 /*yield*/, getProfileId()];
                case 4:
                    profileId = _a.sent();
                    return [4 /*yield*/, getEnterpriseAppVersions({
                            entProfileId: profileId
                        })];
                case 5:
                    appVersions = _a.sent();
                    entVersionId = appVersions[0].id;
                    return [4 /*yield*/, publishEnterpriseAppVersion({
                            entProfileId: profileId,
                            entVersionId: entVersionId,
                            summary: summary,
                            releaseNotes: releaseNotes,
                            publishType: publishType
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    console.log("".concat(appPath, " uploaded to the Appcircle Enterprise App Store successfully"));
                    tl.setResult(tl.TaskResult.Succeeded, "".concat(appPath, " uploaded to the Appcircle Enterprise App Store successfully"));
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    tl.setResult(tl.TaskResult.Failed, err_1.message);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
run();
/* API */
function getToken(pat) {
    return __awaiter(this, void 0, void 0, function () {
        var params, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = new URLSearchParams();
                    params.append("pat", pat);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1["default"].post("https://auth.appcircle.io/auth/v1/token", params.toString(), {
                            headers: {
                                accept: "application/json",
                                "content-type": "application/x-www-form-urlencoded"
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_1 = _a.sent();
                    if (axios_1["default"].isAxiosError(error_1)) {
                        console.error("Axios error:", error_1.message);
                        if (error_1.response) {
                            console.error("Response data:", error_1.response.data);
                            console.error("Response status:", error_1.response.status);
                        }
                    }
                    else {
                        console.error("Unexpected error:", error_1);
                    }
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getToken = getToken;
var UploadServiceHeaders = /** @class */ (function () {
    function UploadServiceHeaders() {
    }
    UploadServiceHeaders.token = "";
    UploadServiceHeaders.getHeaders = function () {
        var response = {
            accept: "application/json",
            "User-Agent": "Appcircle Github Action"
        };
        response.Authorization = "Bearer ".concat(UploadServiceHeaders.token);
        return response;
    };
    return UploadServiceHeaders;
}());
exports.UploadServiceHeaders = UploadServiceHeaders;
var API_HOSTNAME = "https://api.appcircle.io";
exports.appcircleApi = axios_1["default"].create({
    baseURL: API_HOSTNAME.endsWith("/") ? API_HOSTNAME : "".concat(API_HOSTNAME, "/")
});
function getEnterpriseProfiles() {
    return __awaiter(this, void 0, void 0, function () {
        var buildProfiles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.appcircleApi.get("store/v2/profiles", {
                        headers: UploadServiceHeaders.getHeaders()
                    })];
                case 1:
                    buildProfiles = _a.sent();
                    return [2 /*return*/, buildProfiles.data];
            }
        });
    });
}
exports.getEnterpriseProfiles = getEnterpriseProfiles;
function uploadEnterpriseApp(app) {
    return __awaiter(this, void 0, void 0, function () {
        var data, uploadResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = new FormData();
                    data.append("File", fs.createReadStream(app));
                    return [4 /*yield*/, exports.appcircleApi.post("store/v2/profiles/app-versions", data, {
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity,
                            headers: __assign(__assign(__assign({}, UploadServiceHeaders.getHeaders()), data.getHeaders()), { "Content-Type": "multipart/form-data;boundary=" + data.getBoundary() })
                        })];
                case 1:
                    uploadResponse = _a.sent();
                    return [2 /*return*/, uploadResponse.data];
            }
        });
    });
}
exports.uploadEnterpriseApp = uploadEnterpriseApp;
function publishEnterpriseAppVersion(options) {
    return __awaiter(this, void 0, void 0, function () {
        var versionResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.appcircleApi.patch("store/v2/profiles/".concat(options.entProfileId, "/app-versions/").concat(options.entVersionId, "?action=publish"), {
                        summary: options.summary,
                        releaseNotes: options.releaseNotes,
                        publishType: options.publishType
                    }, {
                        headers: UploadServiceHeaders.getHeaders()
                    })];
                case 1:
                    versionResponse = _a.sent();
                    return [2 /*return*/, versionResponse.data];
            }
        });
    });
}
exports.publishEnterpriseAppVersion = publishEnterpriseAppVersion;
function getProfileId() {
    return __awaiter(this, void 0, void 0, function () {
        var profiles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getEnterpriseProfiles().then(function (res) {
                        return res.sort(function (a, b) {
                            return (new Date(b.lastBinaryReceivedDate).getTime() -
                                new Date(a.lastBinaryReceivedDate).getTime());
                        });
                    })];
                case 1:
                    profiles = _a.sent();
                    return [2 /*return*/, profiles[0].id];
            }
        });
    });
}
exports.getProfileId = getProfileId;
function checkTaskStatus(taskId, currentAttempt) {
    if (currentAttempt === void 0) { currentAttempt = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.appcircleApi.get("/task/v1/tasks/".concat(taskId), {
                        headers: UploadServiceHeaders.getHeaders()
                    })];
                case 1:
                    response = _a.sent();
                    if (!((response === null || response === void 0 ? void 0 : response.data.stateValue) == 1 && currentAttempt < 100)) return [3 /*break*/, 3];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, checkTaskStatus(taskId, currentAttempt + 1)];
                case 3:
                    if (response.data.stateValue === 2) {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkTaskStatus = checkTaskStatus;
function getEnterpriseAppVersions(options) {
    return __awaiter(this, void 0, void 0, function () {
        var versionType, profileResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    versionType = "";
                    switch (options === null || options === void 0 ? void 0 : options.publishType) {
                        case "1":
                            versionType = "?publishtype=Beta";
                            break;
                        case "2":
                            versionType = "?publishtype=Live";
                        default:
                            break;
                    }
                    return [4 /*yield*/, exports.appcircleApi.get("store/v2/profiles/".concat(options.entProfileId, "/app-versions").concat(versionType), {
                            headers: UploadServiceHeaders.getHeaders()
                        })];
                case 1:
                    profileResponse = _a.sent();
                    return [2 /*return*/, profileResponse.data];
            }
        });
    });
}
exports.getEnterpriseAppVersions = getEnterpriseAppVersions;
