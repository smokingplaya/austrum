import logger from "./modules/logger/class/logger";
import bodyParser from "body-parser";
import express from "express";
import loader from "./modules/loader";
import path from "path";
import settings from "./config/settings.json";
import Database from "./modules/database";
import { GetUserByToken } from "./modules/utils";
import { YMNotificationError } from "yoomoney-sdk";

logger.Info("🦄 Austrum (ZETA) by smokingplaya<3");

const app = express();
app.set('views', path.join(__dirname, 'data/templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.enable('trust proxy');

app.use((req, res, next) => {
    if (settings.whitelist.enabled) {
        if (req.originalUrl.startsWith('/assets'))
            return next();

        if (!settings.whitelist.allowed.includes(req.ip))
            return res.sendFile(path.join(__dirname, "data/website/whitelist.html"));
    }

    next();
});

/**
 * * Проверка на бан
*/

{
    const database = new Database();

    app.use((req, res, next) => {
        if (req.originalUrl.startsWith('/profile') || req.originalUrl.startsWith('/assets'))
            return next();


        const cookie_token = req["headers"]["cookie"] ? req["headers"]["cookie"].match(/token=([^;]+)/) : undefined;
        const token = (req.body ? req.body.token : undefined) || (cookie_token ? cookie_token[1] : undefined);

        if (!token)
            return next();

        let user = GetUserByToken(token, database);

        if (!user)
            return next();

        if (user.Blocked)
            return res.redirect("/profile");

        next();
    });
}

loader(app);

app.use((_, res) => {
    res.redirect('/404');
});

/*
    [⚠️] используем порт 3000, так как юзаем прокси в виде nginx
*/

app.listen(3000, () => {
    logger.Info("Started on port 3000");
});

export default app;