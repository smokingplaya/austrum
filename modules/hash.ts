import crypto from "crypto";
import fs from "fs";
import crc32 from "crc/crc32";
import secret from "../config/secret.json";
import process from "process";
import path from "path";

const cwd = process.cwd();

let hash = {
    SHA512: (string: crypto.BinaryLike): string => {
        return crypto.createHash("sha512").update(string).digest("hex");
    },

    SHA256: (string: crypto.BinaryLike): string => {
        return crypto.createHash("sha256").update(string).digest("hex");
    },

    CRC32: (file_path: fs.PathOrFileDescriptor, callback: (err: NodeJS.ErrnoException, hash: string) => void): void => {
        fs.readFile(path.join(cwd, file_path), (err, data) => {
            if (err)
                return callback(err, null);

            callback(null, crc32(data).toString());
        });
    },

    HMACSHA256: (payload: crypto.BinaryLike): string => {
        return crypto.createHmac('sha256', secret.jwtKey)
            .update(payload)
            .digest('hex');
    }
};

export default hash;