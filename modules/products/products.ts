import { GetTime, SQLSafe } from "../utils";
import { Add, GetItem } from "../shop/shop";
import User from "../user/class/user";
import product_list from "../../config/products.json";
import hash from "../hash";
import Database from "../database";
import path from "path";

const database = new Database();
database.CreateTable("products_log", {
    "id": "ID",
    "userID": "INTEGER NOT NULL",
    "product": "TEXT NOT NULL",
    "time": "INTEGER NOT NULL"
});

let cwd = process.cwd();

let product_array = [];
let product_formated = {};

let products = {
    UpdateHash: () => {
        for (let item in product_list) {
            product_array.push(item);

            let types = product_list[item]["types"];

            if (!types)
                continue;

            let hashes = {};

            for (let type in types) {
                let file_name = types[type];

                hash.CRC32(path.join("data", "products", item, file_name), (err, hash) => {
                    hashes[file_name.replace(".dll", "")] = hash;
                });
            }

            product_formated[item] = { name: product_list[item].name, hashes: hashes, process: product_list[item].process };
        }
    },

    Get: (product?: string): object => product ? product_formated[product] : product_formated,
    GetList: (): Array<string> => product_array,
    Give: (user: User, name: string, expire: number = 0): number => {
        return Add(user, GetItem(name), expire);
    },

    Download: (product_name: string, user: User, res): boolean => {
        let product = product_list[product_name];

        if (!product)
            return false;

        let has_item = user.HasItem(product_name);

        if (!has_item && (!product["types"] || !product["types"]["free"]))
            return false;

        let sended_product = has_item ? product["types"]["purchased"] : product["types"]["free"];

        database.RunQuery(`INSERT INTO products_log(userID, product, time) VALUES(${SQLSafe(user.ID)}, ${SQLSafe(product_name)}, ${GetTime()})`);

        res.sendFile(path.join("data", "products", product_name, sended_product), { root: cwd });

        return true;
    }
};

products.UpdateHash();

export default products;