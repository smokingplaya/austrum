import logger from "./logger/class/logger";

export function Load(app: any, tab: any) {
    for (let uri in tab) {
        let obj: any = tab[uri];
        let method: string = obj.method.toLowerCase();
        let callback: any = obj.callback;
        let call: unknown = app[method];

        if (!method)
            return logger.Error("route haven't method");

        if (!callback)
            return logger.Error("route function haven't callback");

        if (!call)
            return logger.Error("route have unknown method");

        app[method](uri, callback);
    }
};