import promocodes from "../../..//config/promocodes.json";
import { CloseJSON } from "../../utils";

export default {
    "/promo/getPromo": {
        method: "get",
        callback: (req: any, res: any) => {
            let promo_name = req.query.promo;

            if (!promo_name)
                return CloseJSON(res, 404, "Промокод не найден");

            let discount = promocodes[promo_name];

            if (!discount)
                return CloseJSON(res, 404, "Промокод не найден");

            CloseJSON(res, 200, discount, "discount");
        }
    },
};