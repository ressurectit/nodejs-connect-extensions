import {isJsObject, isPresent, isString, extend, isFunction, isBlank} from '@jscrpt/common';
import fs from 'fs';
import {parse, join} from 'path';
import {ServerResponse} from 'http';
import type {HandleFunction, NextHandleFunction, Server, ErrorHandleFunction, NextFunction, IncomingMessage} from 'connect';

import './connect.extensions.types';
import {ExtendedConnectOptions, HttpMethod, HttpMethodEnum, MockOptions, MockResultFunction, UseFn} from './connect.extensions.interface';

//TODO: correctly define USE signature

type UseHttpMethodArgs = [HttpMethod, string|RegExp, NextHandleFunction?];
type UseRouteArgs = [string|RegExp, NextHandleFunction?];
type UseArgs = UseRouteArgs|UseHttpMethodArgs;

//######################### UTILS METHODS #########################

/**
 * Tests whether is value valid http method
 * @param value - Value to be tested
 */
function isHttpMethod(value: string|RegExp|HttpMethod): value is HttpMethod
{
    return isString(value) && isPresent(HttpMethodEnum[value as HttpMethod]);
}

let originalUse: {(fn: NextHandleFunction): Server; (fn: HandleFunction): Server; (route: string, fn: NextHandleFunction): Server; (route: string, fn: HandleFunction): Server; (route: RegExp, fn: HandleFunction): Server; (method: HttpMethod, route: string, fn: HandleFunction): Server; (method: HttpMethod, route: RegExp, fn: HandleFunction): Server; (fn: NextHandleFunction): Server; (fn: HandleFunction): Server; (route: string, fn: NextHandleFunction): Server; (route: string, fn: HandleFunction): Server; (route: RegExp, fn: HandleFunction): Server; (method: HttpMethod, route: string, fn: HandleFunction): Server; (method: HttpMethod, route: RegExp, fn: HandleFunction): Server; call?: any; apply?: any;};

/**
 * Extends connect use method, adds support for Http method selection and regular expression for matching route and adds method for simple using mocks
 * @param server - NodeJs Connect server instance
 * @param extendedOptions - Additional options applied to extended connect methods
 */
export const extendConnectUse = function extendConnectUse(server: Server, extendedOptions?: ExtendedConnectOptions): void
{
    originalUse = server.use;

    server.use = function(this: Server, routeOrMethodOrFn: HttpMethod|NextHandleFunction|string|RegExp, fnOrRoute?: NextHandleFunction|string|RegExp, fn?: NextHandleFunction): Server
    {
        let method: HttpMethod|undefined;
        let regex: RegExp|undefined;
        let path: string|undefined;
        let func: Exclude<HandleFunction, ErrorHandleFunction> = routeOrMethodOrFn as NextHandleFunction;

        //assigns regex or path according type
        function assignRegexOrPath(route: RegExp|string)
        {
            if(route instanceof RegExp)
            {
                regex = route;
            }
            else
            {
                path = route;
            }
        }

        //specified 3 args METHOD, ROUTE, FN
        if(isPresent(fn))
        {
            //second parameter is route
            assignRegexOrPath(fnOrRoute as string|RegExp);
            func = fn;
            method = routeOrMethodOrFn as HttpMethod;
        }
        //specified 2 args ROUTE, FN
        else if(isPresent(fnOrRoute))
        {
            //first parameter is route
            assignRegexOrPath(routeOrMethodOrFn as string|RegExp);
            func = fnOrRoute as NextHandleFunction;
        }

        //http method selector handler
        //returns true if http method matches or no http method specified
        const methodSelector = function(req: IncomingMessage, res: ServerResponse, next: NextFunction, regexp?: boolean)
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
                if(!regexp)
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
        if(regex)
        {
            return originalUse.call(this, function(req: IncomingMessage, res: ServerResponse, next: NextFunction)
            {
                //http method does not match
                if(!methodSelector(req, res, next, true))
                {
                    return;
                }

                //RegExp route match
                if(regex!.test(req.originalUrl!))
                {
                    //TODO: fix types
                    (req as any).matches = regex!.exec(req.originalUrl!);

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
            return originalUse.call(this, fnOrRoute, methodSelector);
        }
        //Use original method
        else
        {
            return originalUse.apply(this, [path, fnOrRoute].filter(itm => !!itm));
        }
    } as any;

    server.useMock = function(routeOrMethod: string|RegExp|HttpMethod,
                              mockPathOrResultOptionsOrResultFunctionOrRoute: string|RegExp|MockOptions|MockResultFunction,
                              mockPathOrResultOptionsOrResultFunctionOrOptions?: string|MockOptions|MockResultFunction,
                              options?: MockOptions): void
    {
        if(isBlank(routeOrMethod))
        {
            throw new Error('Not enough parameters for "useMock"');
        }

        let httpMethod: HttpMethod|undefined;
        let regex: RegExp|undefined;
        let path: string|undefined;
        let mockPath: string|undefined;
        let resultOptions: MockOptions|undefined;
        let resultFunction: MockResultFunction|undefined;

        //assigns regex or path according type
        function assignRegexOrPath(route: RegExp|string)
        {
            if(route instanceof RegExp)
            {
                regex = route;
            }
            else if(isString(route))
            {
                path = route;
            }
            else
            {
                throw new Error('Route must be defined as string or RegExp');
            }
        }

        //assigns result getter according type
        function assignResult(result: string|MockOptions|MockResultFunction)
        {
            if(isString(result))
            {
                mockPath = result;
            }
            else if(isFunction(result))
            {
                resultFunction = result;
            }
            else if(isJsObject(result))
            {
                resultOptions = result;
            }
            else
            {
                throw new Error('Result getter must be defined as string, or MockOptions object or Function');
            }
        }

        //if http method is first param
        if(isHttpMethod(routeOrMethod))
        {
            //minimal required parameters in this case are 3
            if(isBlank(mockPathOrResultOptionsOrResultFunctionOrRoute) || isBlank(mockPathOrResultOptionsOrResultFunctionOrOptions))
            {
                throw new Error('Not enough parameters for "useMock"');
            }

            httpMethod = routeOrMethod;
            assignRegexOrPath(mockPathOrResultOptionsOrResultFunctionOrRoute as string|RegExp);
            assignResult(mockPathOrResultOptionsOrResultFunctionOrOptions);
        }
        //first parameter is route
        else
        {
            //minimal required parameters in this case are 2
            if(isBlank(mockPathOrResultOptionsOrResultFunctionOrRoute))
            {
                throw new Error('Not enough parameters for "useMock"');
            }

            assignRegexOrPath(routeOrMethod);
            assignResult(mockPathOrResultOptionsOrResultFunctionOrRoute as string|MockOptions|MockResultFunction);
            options = mockPathOrResultOptionsOrResultFunctionOrOptions as MockOptions;
        }

        let useArgs: UseArgs;

        // http method specified
        if(isPresent(httpMethod))
        {
            useArgs = [httpMethod, regex ?? path ?? 'Missing route'];
        }
        else
        {
            useArgs = [regex ?? path ?? 'Missing route'];
        }

        console.log(`Using mocks for ${useArgs[0]} ${useArgs[1]}`);

        ///result from options is not used
        delete options?.result;
        delete server.useMockDefaultOptions?.result;

        let useOptions = extend({},
                                <MockOptions>
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
                                        const items = data.length;
                                        let last = true;
                                        let first = true;
                                        let page = null;
                                        let size = null;
                                        let totalPages = 1;
                                    
                                        if(query.has('size') && query.has('page'))
                                        {
                                            size = parseInt(query.get('size')!);
                                            page = parseInt(query.get('page')!);
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
                                        };
                                    }
                                }, server.useMockDefaultOptions, options);

        useArgs.push(function(req, res)
        {
            console.time(`REQUEST ${req.originalUrl}`);

            if(isBlank(req.url))
            {
                throw new Error('Missing URL parameter in request');
            }

            const query = new URLSearchParams(new URL(req.url).search);
            let data: any;

            //result getter is function
            if(isPresent(resultFunction))
            {
                const matches = (req as any).matches;
                const funcResult = resultFunction(req, matches, query);

                //mock path returned
                if(isString(funcResult))
                {
                    mockPath = funcResult;
                }
                //result options returned
                else if(isJsObject(funcResult))
                {
                    resultOptions = funcResult;
                }
                else
                {
                    throw new Error('Unexpected result returned from handle function');
                }
            }

            //Result getter is mock options object
            if(isPresent(resultOptions))
            {
                //result options have result
                if(isString(resultOptions.result))
                {
                    mockPath = resultOptions.result;
                }
                else
                {
                    mockPath = '';
                }

                data = useOptions.result;
                useOptions = extend({}, useOptions, resultOptions);
            }

            //at this point mock path should be set
            if(isBlank(mockPath))
            {
                throw new Error('Mock path should be set');
            }

            //Checks whether mockPath is valid path to existing file
            function hasMockFile(): boolean
            {
                //at this point mock path should be set
                if(isBlank(mockPath))
                {
                    throw new Error('Mock path should be set');
                }

                //options for extended connect provided and environment was provided
                if(isPresent(extendedOptions) && isPresent(extendedOptions.environment))
                {
                    const parsedPath = parse(mockPath);
                    const envMockPath = join(parsedPath.dir, `${parsedPath.name}.${extendedOptions.environment}${parsedPath.ext}`);

                    //tests environmnet specific mock file for existance
                    if(fs.existsSync(envMockPath))
                    {
                        mockPath = envMockPath;

                        return true;
                    }
                }

                //tests mock path for existance
                return fs.existsSync(mockPath);
            }
            
            //Mock file does not exists
            if(!hasMockFile())
            {
                //no mock file and no resultOptions present
                if(!isPresent(resultOptions))
                {
                    res.statusCode = 500;
                    res.end(`Mock file '${mockPath}' was not found!`);
    
                    console.timeEnd(`REQUEST ${req.originalUrl}`);

                    return;
                }
            }
            //mock file exists
            else
            {
                try
                {
                    data = JSON.parse(fs.readFileSync(mockPath) as unknown as string);

                    console.log(`Using mock file '${mockPath}'`);
                }
                catch(e)
                {
                    res.statusCode = 500;
                    res.end(`Not valid json '${mockPath}'!`);

                    console.timeEnd(`REQUEST ${req.originalUrl}`);

                    return;
                }
            }

            res.statusCode = useOptions.statusCode ?? 200;

            //remove content type header
            if(useOptions.emptyResult)
            {
                delete useOptions.contentType;
            }

            //set content type header if provided by contentType
            if(useOptions.contentType)
            {
                useOptions.responseHeaders = useOptions.responseHeaders ?? {};
                useOptions.responseHeaders['Content-Type'] = useOptions.contentType;
            }

            //sets all headers if available
            if(useOptions.responseHeaders)
            {
                const responseHeaders = useOptions.responseHeaders;

                Object.keys(useOptions.responseHeaders).forEach(header =>
                {
                    const value = responseHeaders[header];

                    //set only headers with value
                    if(isPresent(value))
                    {
                        res.setHeader(header, value);
                    }
                });
            }

            //empty result
            if(useOptions.emptyResult)
            {
                res.end(null);
                console.timeEnd(`REQUEST ${req.originalUrl}`);

                return;
            }

            if(useOptions.dataArray)
            {
                if(useOptions.filterFn)
                {
                    data = useOptions.filterFn(req, query, data);
                }

                if(useOptions.pagingFn)
                {
                    data = useOptions.pagingFn(query, data);
                }

                if(useOptions.dataArrayResultFn)
                {
                    data = useOptions.dataArrayResultFn(data);
                }
            }
            else
            {
                if(useOptions.dataResultFn)
                {
                    data = useOptions.dataResultFn(data);
                }
            }

            if(useOptions.resultFn)
            {
                res.end(useOptions.resultFn(data));
            }

            console.timeEnd(`REQUEST ${req.originalUrl}`);
        });

        (server.use as any).apply(server, useArgs);
    };
};

/**
 * Restore original connect use method if was previously extended
 * @param server - NodeJs Connect server instance
 */
export const restoreConnectUse = function restoreConnectUse(server: Server): void
{
    server.use = originalUse;
};