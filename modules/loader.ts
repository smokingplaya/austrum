/*
    devulshit666 aka zeta webserver
                coded by smokingplaya
*/

import { FileExists } from "./utils";
const fs = require("fs");
const routing = require("./routing");
const items = fs.readdirSync(process.cwd() + "/modules/", { withFileTypes: true });

let cwd: string = process.cwd();

function Initialize(app: unknown) {
    for (let item of items) {
        if (!item.isDirectory())
            continue;

        let name = item.name;

        let path = name + "/route/route.ts";

        if (!FileExists(cwd + "/modules/" + path)) {
            continue;
        }

        let routes = require("./" + path);

        routing.Load(app, routes.default);
    }
};

export default Initialize;