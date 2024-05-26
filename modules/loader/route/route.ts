import path from "path";
import info from "../../../config/loader.json";
import statistic from "../../statistic/statistic";
import Loader from "../class/loader";
import { CloseJSON, Close, GetFileFromPath } from "../../utils";
import { cwd } from "process";

export default {
    "/loader/version": {
        method: "get",
        callback: (_, res) => {
            return CloseJSON(res, 200, info.version, "version");
        }
    },

    "/loader/download": {
        method: "get",
        callback: (_, res) => {
            let full_path = path.join(cwd(), info.updater.paths.zip);

            statistic.Plus("downloads");

            res.set("Content-Disposition", `attachment; filename="${GetFileFromPath(full_path)}"`);
            res.sendFile(full_path);
        }
    },

    "/loader/download_exe": {
        method: "get",
        callback: (_, res) => {
            let full_path = path.join(cwd(), info.paths.exe);

            res.set("Content-Disposition", `attachment; filename="${GetFileFromPath(full_path)}"`);
            res.sendFile(full_path);
        }
    },

    "/loader/hash": {
        method: "get",
        callback: (_, res) => {
            Close(res, 200, Loader.GetHash());
        }
    }
};