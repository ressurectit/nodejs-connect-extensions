var fs = require('fs'),
    extend = require('extend'),
    url = require('url'),
    {isJsObject, isPresent, isString} = require('@jscrpt/common');

var originalUse = null;

exports.extendConnectUse = function(server)
{
    originalUse = server.use;

    server.use = function()
    {
        var regex = arguments[0];
        var func = arguments[1];
        var method;

        //specified 3 arguments METHOD, REGEX, FN
        if(arguments.length == 3)
        {
            regex = arguments[1];
            func = arguments[2];
            method = arguments[0];
        }

        //http method selector handler
        //returns true if http method matches or no http method specified
        var methodSelector = function(req, res, next)
        {
            //no http method specified
            if(!method)
            {
                return true;
            }

            //http method matches
            if(method == req.method)
            {
                //runs code only if not RegExp route was used
                if(!arguments[3])
                {
                    func(req, res, next);
                }

                return true;
            }
            //http method does not match
            else
            {
                next();

                return false;
            }
        };

        //Route parameter specified as RegExp
        if(regex instanceof RegExp)
        {
            return originalUse.call(this, function (req, res, next)
            {
                //http method does not match
                if(!methodSelector(req, res, next, true))
                {
                    return;
                }

                //RegExp route match
                if(regex.test(req.originalUrl))
                {
                    req.matches = regex.exec(req.originalUrl);

                    func(req, res, next);
                }
                //RegExp route does not match
                else
                {
                    next();
                }
            });
        }

        //Http method specified
        if(method)
        {
            return originalUse.call(this, arguments[1], methodSelector);
        }
        //Use original method
        else
        {
            return originalUse.apply(this, arguments);
        }
    };

    server.useMock = function()
    {
        var useArgs = [arguments[0]];
        var mockPath = arguments[1];
        var options = arguments[2];

        if(arguments.length > 2 && (typeof options == "string" || typeof options == "function"))
        {
            useArgs = [arguments[0], arguments[1]];
            mockPath = arguments[2];
            options = arguments[3];
        }

        console.log(`Using mocks for ${useArgs[0]} ${useArgs[1]}`);

        var options, originalOptions = extend({},
        {
            contentType: 'application/json',
            statusCode: 200,
            emptyResult: false,
            dataArray: false,
            resultFn: result => JSON.stringify(result),
            dataResultFn: data => data,
            dataArrayResultFn: data => data,
            pagingFn: (query, data) =>
            {
                let items = data.length;
                let last = true;
                let first = true;
                let page = null;
                let size = null;
                let totalPages = 1;

                if(query.size && query.page)
                {
                    size = parseInt(query.size);
                    page = parseInt(query.page);
                    totalPages = Math.ceil(items / size);

                    if(page > 0)
                    {
                        first = false;
                    }

                    data = data.slice(page * size, (page * size) + size);
                    last = items <= (page * size) + size;
                }

                return {
                    content: data,
                    last: last,
                    totalElements: items,
                    numberOfElements: data.length,
                    first: first,
                    number: page,
                    size: size,
                    totalPages: totalPages
                }
            }
        }, server.useMockDefaultOptions, options);

        useArgs.push(function(req, res)
        {
            console.time(`REQUEST ${req.originalUrl}`);

            var data;
            var handleObj;
            var urlParts = url.parse(req.url, true);
            var query = urlParts.query;
            var matches = req.matches;
            var mockPathString = mockPath;

            //mock path is selection function
            if(typeof mockPath == "function")
            {
                mockPathString = mockPath(req, matches, query);

                //handle response object
                if(isJsObject(mockPathString))
                {
                    handleObj = mockPathString;

                    if(isString(handleObj.result))
                    {
                        mockPathString = handleObj.result;
                    }
                    else
                    {
                        mockPathString = "";
                    }
                }
            }

            options = originalOptions;

            //Mock file does not exists
            if(!fs.existsSync(mockPathString))
            {
                if(isPresent(handleObj))
                {
                    options = extend({}, options, handleObj);
                    data = handleObj.result;
                }
                else
                {
                    res.statusCode = 500;
                    res.end(`Mock file '${mockPathString}' was not found!`);
    
                    console.timeEnd(`REQUEST ${req.originalUrl}`);

                    return;
                }
            }
            else
            {
                try
                {
                    data = JSON.parse(fs.readFileSync(mockPathString));

                    console.log(`Using mock file '${mockPathString}'`);
                }
                catch(e)
                {
                    res.statusCode = 500;
                    res.end(`Not valid json '${mockPathString}'!`);

                    console.timeEnd(`REQUEST ${req.originalUrl}`);

                    return;
                }
            }

            res.statusCode = options.statusCode;

            if(options.emptyResult)
            {
                res.end(null);
                console.timeEnd(`REQUEST ${req.originalUrl}`);

                return;
            }

            res.setHeader('Content-Type', options.contentType);

            if(options.dataArray)
            {
                if(options.filterFn)
                {
                    data = options.filterFn(req, query, data);
                }

                data = options.pagingFn(query, data);
                data = options.dataArrayResultFn(data);
            }
            else
            {
                data = options.dataResultFn(data);
            }

            res.end(options.resultFn(data));

            console.timeEnd(`REQUEST ${req.originalUrl}`);
        });

        server.use.apply(server, useArgs);
    };
};

exports.restoreConnectUse = function(server)
{
    server.use = originalUse;
    delete server.useMock;
};