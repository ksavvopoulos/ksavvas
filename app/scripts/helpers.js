(function (window) {
    "use strict";
    var appUrl, hostUrl, executor, context, factory, ind;

    function getQueryStringParameter(param) {
        var params = document.URL.split("?")[1].split("&"),
            i, singleParam;

        for (i = 0; i < params.length; i = i + 1) {
            singleParam = params[i].split("=");
            if (singleParam[0] === param) {
                return singleParam[1];
            }
        }
    }

    function getAsync(url) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "GET",
            dataType: "json",
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function (data) {
                defer.resolve(data);
            },
            fail: function (error) {
                defer.reject(error);
            }
        });

        return defer.promise();
    }

    function deleteAsync(url, etag) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-HTTP-Method": "DELETE",
                "If-Match": etag
            },
            success: function () {
                defer.resolve();
            },
            fail: function (error) {
                defer.reject(error);
            }
        });

        return defer.promise();
    }

    function updateAsync(url, data) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-HTTP-Method": "MERGE",
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                defer.resolve(data);
            },
            fail: function (error) {
                defer.reject(error);
            }
        });

        return defer.promise();

    }

    function createAsync(url, data) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            },
            success: function (data) {
                defer.resolve(data);
            },
            fail: function (error) {
                defer.reject(error);
            }
        });

        return defer.promise();
    }

    appUrl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));

    if (appUrl.indexOf('#') !== -1) {
        appUrl = appUrl.split('#')[0];
    }

    hostUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
    executor = new SP.RequestExecutor(appUrl);
    context = SP.ClientContext.get_current();
    factory = SP.ProxyWebRequestExecutorFactory(appUrl);

    ind = {
        rest: {
            getHostLists: function (query) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists?" + query + "&@target='" + hostUrl + "'";

                return getAsync(url);
            },
            getHostListByTitle: function (listTitle, query) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')?" + query + "&@target='" + hostUrl + "'";

                return getAsync(url);
            },
            getHostListItems: function (listTitle, query) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')/Items?" + query + "&@target='" + hostUrl + "'";

                return getAsync(url);
            },
            getHostListFields: function (listTitle, query) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')/Fields?" + query + "&@target='" + hostUrl + "'";

                return getAsync(url);
            },
            createHostList: function (list) {
                var data,
                    url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists?&@target='" + hostUrl + "'";

                data = {
                    "__metadata": {
                        type: "SP.List"
                    },
                    BaseTemplate: list.Template,
                    Title: list.Title
                };

                return createAsync(url, data);
            },
            addHostListItem: function (listTitle, item) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')/Items?&@target='" + hostUrl + "'";

                return createAsync(url, item);
            },
            deleteHostListItem: function (listTitle, itemId, etag) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')/Items(" + itemId + ")?&@target='" + hostUrl + "'";

                return deleteAsync(url, etag);
            },
            updateHostListItem: function (listTitle, item) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')/Items(" + item.Id + ")?&@target='" + hostUrl + "'";

                return updateAsync(url, item);
            },
            updateHostList: function (listTitle, listData) {
                var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('" + listTitle + "')?&@target='" + hostUrl + "'";

                return updateAsync(url, listData);
            }
        },
        csom: {
            createHostList: function (list) {
                var appContextSite,
                    web, listCreationInfo, newList;

                context.set_webRequestExecutorFactory(factory);
                appContextSite = new SP.AppContextSite(context, hostUrl);

                web = appContextSite.get_web();

                listCreationInfo = new SP.ListCreationInformation();
                listCreationInfo.set_title(list.Title);
                listCreationInfo.set_templateType(list.Type);

                newList = web.get_lists().add(listCreationInfo);

                context.load(newList);
                context.executeQueryAsync(success, fail);

                function success() {
                    var result = newList.get_title() + ' created.';
                    alert(result);
                }

                function fail(sender, args) {
                    alert('Request failed. ' + args.get_message() +
                        '\n' + args.get_stackTrace());
                }
            },
            createHostSite: function (webToCreate) {
                var appContextSite,
                    web, webCreationInfo, newWeb;

                context.set_webRequestExecutorFactory(factory);
                appContextSite = new SP.AppContextSite(context, hostUrl);

                web = appContextSite.get_web();

                webCreationInfo = new SP.WebCreationInformation();
                webCreationInfo.set_title(webToCreate.Title);
                webCreationInfo.set_webTemplate(webToCreate.Template);
                webCreationInfo.set_url(webToCreate.Url);
                webCreationInfo.set_language(webToCreate.language);
                webCreationInfo.set_useSamePermissionsAsParentSite(webToCreate.inheritPerms);

                newWeb = web.get_webs().add(webCreationInfo);

                context.load(newWeb);

                context.executeQueryAsync(success, fail);

                function success() {
                    var result = newWeb.get_title() + ' created.';
                    alert(result);
                }

                function fail(sender, args) {
                    alert('Request failed. ' + args.get_message() +
                        '\n' + args.get_stackTrace());
                }
            }
        },
        getHostUrl: function () {
            return hostUrl;
        }
    };

    window.ind = ind;

}(window));