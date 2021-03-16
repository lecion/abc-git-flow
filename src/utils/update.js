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
var net_1 = require("./net");
var semver = require("semver");
var fs = require("fs");
var child_process_1 = require("child_process");
function getRemoteVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var version, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    version = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, net_1["default"].get('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/manifest.json', {
                            responseType: 'json'
                        })];
                case 2:
                    response = _a.sent();
                    //@ts-ignore
                    version = response.body.version;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, version];
            }
        });
    });
}
function download(url, fileName, progressCb) {
    return __awaiter(this, void 0, void 0, function () {
        var downloadStream, writeStream;
        return __generator(this, function (_a) {
            downloadStream = net_1["default"].stream(url);
            downloadStream.on('downloadProgress', function (process) {
                progressCb && progressCb(process.percent);
            });
            writeStream = fs.createWriteStream(fileName);
            downloadStream.pipe(writeStream);
            return [2 /*return*/];
        });
    });
}
function checkUpdate(currentVersion) {
    return __awaiter(this, void 0, void 0, function () {
        var newVersion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRemoteVersion()];
                case 1:
                    newVersion = _a.sent();
                    console.log('当前版本：', currentVersion, '最新版本：', newVersion);
                    if (!semver.gt(newVersion, currentVersion)) return [3 /*break*/, 3];
                    console.log('即将下载最新版本');
                    return [4 /*yield*/, download('https://cis-static-common.oss-cn-shanghai.aliyuncs.com/assets/abc-git-flow/git-abc-macos', 'git-abc', function (progress) {
                            var percent = (progress * 100).toFixed(2);
                            console.log("下载进度", percent + '%');
                        })];
                case 2:
                    _a.sent();
                    child_process_1.execSync("chmod a+x git-abc");
                    child_process_1.execSync("mv ./git-abc /usr/local/bin/git-abc");
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkUpdate = checkUpdate;
checkUpdate('0.1.3');
