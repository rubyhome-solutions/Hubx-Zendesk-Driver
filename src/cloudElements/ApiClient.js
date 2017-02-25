"use strict";
class ApiClient {
    constructor() {
        this.basePath = 'https://console.cloud-elements.com/elements/api-v2/hubs/helpdesk'.replace(/\/+$/, '');
        this.authentications = {};
        this.defaultHeaders = {};
        this.timeout = 60000;
        this.superagent = require("superagent");
        this.CollectionFormatEnum = {
            CSV: ',',
            SSV: ' ',
            TSV: '\t',
            PIPES: '|',
            MULTI: 'multi'
        };
    }
    ;
    getNewInstance() {
        return new ApiClient();
    }
    ;
    paramToString(param) {
        if (param == undefined || param == null) {
            return '';
        }
        if (param instanceof Date) {
            return param.toJSON();
        }
        return param.toString();
    }
    ;
    buildUrl(path, pathParams) {
        if (!path.match(/^\//)) {
            path = '/' + path;
        }
        var url = this.basePath + path;
        var _this = this;
        url = url.replace(/\{([\w-]+)\}/g, function (fullMatch, key) {
            var value;
            if (pathParams.hasOwnProperty(key)) {
                value = _this.paramToString(pathParams[key]);
            }
            else {
                value = fullMatch;
            }
            return encodeURIComponent(value);
        });
        return url;
    }
    ;
    isJsonMime(contentType) {
        return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
    }
    ;
    jsonPreferredMime(contentTypes) {
        for (var i = 0; i < contentTypes.length; i++) {
            if (this.isJsonMime(contentTypes[i])) {
                return contentTypes[i];
            }
        }
        return contentTypes[0];
    }
    ;
    isFileParam(param) {
        if (typeof window === 'undefined' &&
            typeof require === 'function' &&
            require('fs') &&
            param instanceof require('fs').ReadStream) {
            return true;
        }
        if (typeof Buffer === 'function' && param instanceof Buffer) {
            return true;
        }
        if (typeof Blob === 'function' && param instanceof Blob) {
            return true;
        }
        if (typeof File === 'function' && param instanceof File) {
            return true;
        }
        return false;
    }
    ;
    normalizeParams(params) {
        var newParams = {};
        for (var key in params) {
            if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
                var value = params[key];
                if (this.isFileParam(value) || Array.isArray(value)) {
                    newParams[key] = value;
                }
                else {
                    newParams[key] = this.paramToString(value);
                }
            }
        }
        return newParams;
    }
    ;
    buildCollectionParam(param, collectionFormat) {
        if (param == null) {
            return null;
        }
        switch (collectionFormat) {
            case 'csv':
                return param.map(this.paramToString).join(',');
            case 'ssv':
                return param.map(this.paramToString).join(' ');
            case 'tsv':
                return param.map(this.paramToString).join('\t');
            case 'pipes':
                return param.map(this.paramToString).join('|');
            case 'multi':
                return param.map(this.paramToString);
            default:
                throw new Error('Unknown collection format: ' + collectionFormat);
        }
    }
    ;
    applyAuthToRequest(request, authNames) {
        var _this = this;
        authNames.forEach(function (authName) {
            var auth = _this.authentications[authName];
            switch (auth.type) {
                case 'basic':
                    if (auth.username || auth.password) {
                        request.auth(auth.username || '', auth.password || '');
                    }
                    break;
                case 'apiKey':
                    if (auth.apiKey) {
                        var data = {};
                        if (auth.apiKeyPrefix) {
                            data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
                        }
                        else {
                            data[auth.name] = auth.apiKey;
                        }
                        if (auth['in'] === 'header') {
                            request.set(data);
                        }
                        else {
                            request.query(data);
                        }
                    }
                    break;
                case 'oauth2':
                    if (auth.accessToken) {
                        request.set({ 'Authorization': 'Bearer ' + auth.accessToken });
                    }
                    break;
                default:
                    throw new Error('Unknown authentication type: ' + auth.type);
            }
        });
    }
    ;
    deserialize(response, returnType) {
        if (response == null || returnType == null) {
            return null;
        }
        var data = response.body;
        if (data == null) {
            data = response.text;
        }
        return this.convertToType(data, returnType);
    }
    ;
    callApi(path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType, callback) {
        var _this = this;
        var url = this.buildUrl(path, pathParams);
        var request = this.superagent(httpMethod, url);
        this.applyAuthToRequest(request, authNames);
        request.query(this.normalizeParams(queryParams));
        request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));
        request.timeout(this.timeout);
        var contentType = this.jsonPreferredMime(contentTypes);
        if (contentType) {
            request.type(contentType);
        }
        else if (!request.header['Content-Type']) {
            request.type('application/json');
        }
        if (contentType === 'application/x-www-form-urlencoded') {
            request.send(this.normalizeParams(formParams));
        }
        else if (contentType == 'multipart/form-data') {
            var _formParams = this.normalizeParams(formParams);
            for (var key in _formParams) {
                if (_formParams.hasOwnProperty(key)) {
                    if (this.isFileParam(_formParams[key])) {
                        request.attach(key, _formParams[key]);
                    }
                    else {
                        request.field(key, _formParams[key]);
                    }
                }
            }
        }
        else if (bodyParam) {
            request.send(bodyParam);
        }
        var accept = this.jsonPreferredMime(accepts);
        if (accept) {
            request.accept(accept);
        }
        request.end(function (error, response) {
            if (callback) {
                var data = null;
                if (!error) {
                    data = _this.deserialize(response, returnType);
                }
                callback(error, data, response);
            }
        });
        return request;
    }
    ;
    parseDate(str) {
        return new Date(str.replace(/T/i, ' '));
    }
    ;
    convertToType(data, type) {
        switch (type) {
            case 'Boolean':
                return Boolean(data);
            case 'Integer':
                return parseInt(data, 10);
            case 'Number':
                return parseFloat(data);
            case 'String':
                return String(data);
            case 'Date':
                return this.parseDate(String(data));
            default:
                if (type === Object) {
                    return data;
                }
                else if (typeof type === 'function') {
                    return type.constructFromObject(data);
                }
                else if (Array.isArray(type)) {
                    var itemType = type[0];
                    return data.map(function (item) {
                        return exports.convertToType(item, itemType);
                    });
                }
                else if (typeof type === 'object') {
                    var keyType, valueType;
                    for (var k in type) {
                        if (type.hasOwnProperty(k)) {
                            keyType = k;
                            valueType = type[k];
                            break;
                        }
                    }
                    var result = {};
                    for (var k in data) {
                        if (data.hasOwnProperty(k)) {
                            var key = exports.convertToType(k, keyType);
                            var value = exports.convertToType(data[k], valueType);
                            result[key] = value;
                        }
                    }
                    return result;
                }
                else {
                    return data;
                }
        }
    }
    ;
}
exports.ApiClient = ApiClient;
;
//# sourceMappingURL=ApiClient.js.map