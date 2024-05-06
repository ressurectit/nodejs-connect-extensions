import type {MockOptions, HttpMethod, MockResultFunction} from './connect.extensions.interface';

declare module 'connect'
{
    interface Server
    {
        /**
         * Runs handle function if regular expression matches, regular expression matches are passed to handle as matches property of request
         * @param route - Route specified as regular expression
         * @param fn - Handle function
         */
        use(route: RegExp, fn: HandleFunction): Server;

        /**
         * Runs handle function if regular expression matches, regular expression matches are passed to handle as matches property of request
         * @param route - Route specified as regular expression
         * @param fn - Handle function
         */
        use(route: RegExp, fn: NextHandleFunction): Server;

        /**
         * Runs handle function if http method and route matches
         * @param method - Http method name which be checked for match
         * @param route - Route specified as url prefix string
         * @param fn - Handle function
         */
        use(method: HttpMethod, route: string, fn: HandleFunction): Server;

        /**
         * Runs handle function if http method and route matches
         * @param method - Http method name which be checked for match
         * @param route - Route specified as url prefix string
         * @param fn - Handle function
         */
        use(method: HttpMethod, route: string, fn: NextHandleFunction): Server;

        /**
         * Runs handle function if regular expression and http method matches, regular expression matches are passed to handle as matches property of request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as regular expression
         * @param fn - Handle function
         */
        use(method: HttpMethod, route: RegExp, fn: HandleFunction): Server;

        /**
         * Runs handle function if regular expression and http method matches, regular expression matches are passed to handle as matches property of request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as regular expression
         * @param fn - Handle function
         */
        use(method: HttpMethod, route: RegExp, fn: NextHandleFunction): Server;

        /**
         * Returns mocked data according specified options if route matches request
         * @param route - Route specified as url prefix string
         * @param mockPath - Path to mock file that contains json to be returned
         * @param options - Options that contains definition of response, result is not used
         */
        useMock(route: string, mockPath: string, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if route matches request
         * @param route - Route specified as url prefix string
         * @param resultOptions - Options that contains definition of response
         */
        useMock(route: string, resultOptions: MockOptions): void;
        
        /**
         * Returns mocked data according specified options if route matches request
         * @param route - Route specified as url prefix string
         * @param resultFunction - Function that receives request, matches and query parameters and returns path to file or options that contains definition of response
         * @param options - Options that contains definition of response, result is not used or parameter is not used at all if function returns options
         */
        useMock(route: string, resultFunction: MockResultFunction, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if route matches request
         * @param route - Route specified as regular expression
         * @param mockPath - Path to mock file that contains json to be returned
         * @param options - Options that contains definition of response, result is not used and
         */
        useMock(route: RegExp, mockPath: string, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if route matches request
         * @param route - Route specified as regular expression
         * @param resultOptions - Options that contains definition of response
         */
        useMock(route: RegExp, resultOptions: MockOptions): void;

        /**
         * Returns mocked data according specified options if route matches request
         * @param route - Route specified as regular expression
         * @param resultFunction - Function that receives request, matches and query parameters and returns path to file or options that contains definition of response
         * @param options - Options that contains definition of response, result is not used or parameter is not used at all if function returns options
         */
        useMock(route: RegExp, resultFunction: MockResultFunction, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if method and route matches request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as url prefix string
         * @param mockPath - Path to mock file that contains json to be returned
         * @param options - Options that contains definition of response, result is not used
         */
        useMock(method: HttpMethod, route: string, mockPath: string, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if method and route matches request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as url prefix string
         * @param resultOptions - Options that contains definition of response
         */
        useMock(method: HttpMethod, route: string, resultOptions: MockOptions): void;

        /**
         * Returns mocked data according specified options if method and route matches request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as url prefix string
         * @param resultFunction - Function that receives request, matches and query parameters and returns path to file or options that contains definition of response
         * @param options - Options that contains definition of response, result is not used or parameter is not used at all if function returns options
         */
        useMock(method: HttpMethod, route: string, resultFunction: MockResultFunction, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if method and route matches request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as regular expression
         * @param mockPath - Path to mock file that contains json to be returned
         * @param options - Options that contains definition of response, result is not used
         */
        useMock(method: HttpMethod, route: RegExp, mockPath: string, options?: MockOptions): void;

        /**
         * Returns mocked data according specified options if method and route matches request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as regular expression
         * @param resultOptions - Options that contains definition of response
         */
        useMock(method: HttpMethod, route: RegExp, resultOptions: MockOptions): void;

        /**
         * Returns mocked data according specified options if method and route matches request
         * @param method - Http method name which be checked for match
         * @param route - Route specified as regular expression
         * @param resultFunction - Function that receives request, matches and query parameters and returns path to file or options that contains definition of response
         * @param options - Options that contains definition of response, result is not used or parameter is not used at all if function returns options
         */
        useMock(method: HttpMethod, route: RegExp, resultFunction: MockResultFunction, options?: MockOptions): void;

        /**
         * Default options for `useMock` method used in every request
         */
        useMockDefaultOptions?: MockOptions;
    }
}