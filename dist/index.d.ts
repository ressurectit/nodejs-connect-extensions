/// <reference types="node" />
/// <reference types="connect" />

import * as http from "http";

declare namespace createServer
{
    /**
     * Representation of data that are paged
     */
    export interface PagedData
    {
        /**
         * Reveived data
         */
        content?: any[];

        /**
         * Count of all available pages
         */
        totalPages?: number;

        /**
         * Count of all items that are available
         */
        totalElements?: number;

        /**
         * Indication that this page is last or not
         */
        last?: boolean;

        /**
         * Requested number of items
         */
        size?: number;

        /**
         * Requested page number
         */
        number?: number;

        /**
         * Indication whether is this first page
         */
        first?: boolean;

        /**
         * Number of returned items
         */
        numberOfElements?: number;
    }

    /**
     * Object that contains options for mocking
     */
    export interface MockOptions
    {
        /**
         * Result Content-Type header value
         */
        contentType?: string;

        /**
         * Results http status code
         */
        statusCode?: number;

        /**
         * Indication whether return empty result, disables Content-Type and sets result to null
         */
        emptyResult?: boolean;

        /**
         * Indication whether result is array of objects, or single object
         */
        dataArray?: boolean;

        /**
         * Method used for creating result if dataArray is true
         */
        dataArrayResultFn?: (data: PagedData) => any;

        /**
         * Method used for creating result if dataArray is false
         */
        dataResultFn?: (data: any) => any;

        /**
         * Method that converts data to result written to response
         */
        resultFn?: (result: any) => any;

        /**
         * Method applies paging to data if dataArray is true
         */
        pagingFn?: (query: any, data: any[]) => PagedData;

        /**
         * Method that applies filter to data if dataArray is true
         */
        filterFn?: (req: http.IncomingMessage, query: any, data: any[]) => any[];
    }

    export interface Server extends NodeJS.EventEmitter
    {
        /**
         * Runs handle function if regular expression matches, regular expression matches are passed to handle as matches property of request
         * @param route Route specified as regular expression
         * @param fn Handle function
         */
        use(route: RegExp, fn: createServer.HandleFunction): Server;

        /**
         * Runs handle function if http method and route matches
         * @param method Http method name which be checked for match
         * @param route Route specified as url prefix string
         * @param fn Handle function
         */
        use(method: string, route: string, fn: createServer.HandleFunction): Server;

        /**
         * Runs handle function if regular expression and http method matches, regular expression matches are passed to handle as matches property of request
         * @param method Http method name which be checked for match
         * @param route Route specified as regular expression
         * @param fn Handle function
         */
        use(method: string, route: RegExp, fn: createServer.HandleFunction): Server;

        /**
         * Returns mockPath data according specified options if route matches request
         * @param route Route specified as url prefix string
         * @param mockPath Path to mock file that contains json to be returned, or function that receives request, matches and query parameters and returns path to file
         * @param options Options for returning data
         */
        useMock(route: string, mockPath: string|((req: http.IncomingMessage, matches: RegExpExecArray, query: any) => string), options?: MockOptions): Server;

        /**
         * Returns mockPath data according specified options if route matches request
         * @param route Route specified as regular expression
         * @param mockPath Path to mock file that contains json to be returned, or function that receives request, matches and query parameters and returns path to file
         * @param options Options for returning data
         */
        useMock(route: RegExp, mockPath: string|((req: http.IncomingMessage, matches: RegExpExecArray, query: any) => string), options?: MockOptions): Server;

        /**
         * Returns mockPath data according specified options if method and route matches request
         * @param method Http method name which be checked for match
         * @param route Route specified as url prefix string
         * @param mockPath Path to mock file that contains json to be returned, or function that receives request, matches and query parameters and returns path to file
         * @param options Options for returning data
         */
        useMock(method: string, route: string, mockPath: string|((req: http.IncomingMessage, matches: RegExpExecArray, query: any) => string), options?: MockOptions): Server;

        /**
         * Returns mockPath data according specified options if method and route matches request
         * @param method Http method name which be checked for match
         * @param route Route specified as regular expression
         * @param mockPath Path to mock file that contains json to be returned, or function that receives request, matches and query parameters and returns path to file
         * @param options Options for returning data
         */
        useMock(method: string, route: RegExp, mockPath: string|((req: http.IncomingMessage, matches: RegExpExecArray, query: any) => string), options?: MockOptions): Server;
    }
}

/**
 * NodeJs Connect server extensions
 */
declare namespace ConnectExtensions
{
    /**
     * Extends connect use method, adds support for Http method selection and regular expression for matching route and adds method for simple using mocks
     * @param {createServer.Server} server NodeJs Connect server instance
     */
    export function extendConnectUse(server: createServer.Server): void;

    /**
     * Restore original connect use method if was previously extended
     * @param {createServer.Server} server NodeJs Connect server instance
     */
    export function restoreConnectUse(server: createServer.Server): void;
}

declare module "nodejs-connect-extensions"
{
    export = ConnectExtensions;
}