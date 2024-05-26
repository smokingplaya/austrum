import { CloseJSON, CloseJSONObject, Close, GetUserByToken } from "../../utils";
import products from "../products";
import Database from "../../database";

const database = new Database();

let product_list = products.Get();
let product_array = products.GetList();

export default {
    "/products": {
        method: "post",
        callback: (req, res) => {
            let body = req.body;

            if (!body || body.length === 0 || !body["token"])
                return Close(res, 401);

            let user = GetUserByToken(body["token"], database);

            if (!user)
                return Close(res, 401);

            let products_purchased = {};

            for (let i in product_array) {
                let name = product_array[i];

                let prod = product_list[name];

                products_purchased[name] = user.HasItem(name) ?
                    { name: prod.name, hash: prod.hashes.purchased, process: prod.process } :
                    (prod.hashes.free ?
                        ({ name: prod.name, hash: prod.hashes.free, process: prod.process }) :
                        undefined);
            }

            CloseJSONObject(res, 200, products_purchased);
        }
    },

    "/products/download": {
        method: "post",
        callback: (req, res) => {
            let body = req.body;

            let product = body["name"];

            if (!product || !product_array.includes(product))
                return CloseJSON(res, 404, "Продукт не найден");

            let user = GetUserByToken(body["token"], database);

            if (!user)
                return Close(res, 401);

            let url = products.Download(product, user, res);

            if (!url)
                return CloseJSON(res, 404, "У вас нет прав на использование этого продукта.");
        }
    }
};