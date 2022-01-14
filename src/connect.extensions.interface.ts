import {StringDictionary} from '@jscrpt/common';
import {HandleFunction, NextHandleFunction, Server} from 'connect';
import type http from 'http';

/**
 * All available http methods
 */
export type HttpMethod = 'CONNECT'|'DELETE'|'GET'|'HEAD'|'OPTIONS'|'PATCH'|'POST'|'PUT'|'TRACE';

/**
 * All available http methods as enum
 */
export enum HttpMethodEnum
{
    CONNECT,
    DELETE,
    GET,
    HEAD,
    OPTIONS,
    PATCH,
    POST,
    PUT,
    TRACE
}

/**
 * Signature of all use methods
 */
export type UseFn = (fnOrRouteOrMethod: string|NextHandleFunction|HandleFunction|RegExp|HttpMethod,
                     fnOrRoute?: NextHandleFunction|HandleFunction|string|RegExp,
                     fn?: HandleFunction) => Server;

/**
 * Definition of function that receives request, matches and query parameters and returns path to file or options that contains definition of response
 */
export type MockResultFunction = (req: http.IncomingMessage, matches: RegExpExecArray, query: URLSearchParams) => string|MockOptions;

/**
 * Representation of data that are paged
 */
export interface PagedData
{
    /**
     * Reveived data
     */
    content: any[];

    /**
     * Count of all available pages
     */
    totalPages: number;

    /**
     * Count of all items that are available
     */
    totalElements: number;

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
     * Object storing additional response headers, allows overriding globally defined headers, headers can be unset by setting value to null or undefined
     * 
     * if Content-Type is set and also contentType property is set, contentType property takes precedence
     */
    responseHeaders?: StringDictionary;

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
     * Result that is returned as http response body, used only when function returns MockOptions, or options are used as resultOptions parameter, if result is path to existing json file it will be used
     */
    result?: any;

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
    pagingFn?: (query: URLSearchParams, data: any[]) => PagedData;

    /**
     * Method that applies filter to data if dataArray is true
     */
    filterFn?: (req: http.IncomingMessage, query: URLSearchParams, data: any[]) => any[];
}

/**
 * Definition of additional options for extended connect server
 */
export interface ExtendedConnectOptions
{
    /**
     * Allows usage of environment specific json files (name.<environment>.json)
     */
    environment?: string;
}
