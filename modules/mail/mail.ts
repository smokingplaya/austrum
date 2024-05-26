import mails from "../../config/mails.json";
import fs from "fs";
import { createTransport } from 'nodemailer';
import logger from "../logger/class/logger";

let emails = [];

fs.readdirSync('./data/mails').filter(file => file.endsWith(".html")).forEach(file => {
    fs.readFile("./data/mails/" + file, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            emails[file.replace(".html", "")] = data;
        }
    });
});

const transporter = createTransport({
    host: '127.0.0.1',
    port: 25,
    secure: false,
    logger: true,
    tls: {
        rejectUnauthorized: false
    }
});

let mail = {
    Send: (email: string, email_type: string, content) => {
        const message_data = mails[email_type];

        if (!message_data)
            return logger.Error(`Type of mail \"${email_type}\" is not defined.`);

        let msg = emails[message_data.file];

        for (let key in content) {
            let value = content[key];

            let regex = new RegExp("\\{\\{" + key + "\\}\\}", "g");

            msg = msg.replace(regex, value);
        }

        transporter.sendMail({
            to: email,
            from: "admin@zetaproduct.ru",
            subject: message_data.name,
            html: msg
        }, () => { }, () => { });
    },

    GetAllowed(): string[] {
        return mails.allowedEmails;
    },

    IsAllowed: (email: String): boolean => {
        let splitted = email.split("@");

        if (splitted.length != 2)
            return false;

        let mailService = splitted[1];

        return mail.GetAllowed().includes(mailService);
    }
};

export default mail;