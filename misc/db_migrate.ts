/*
    перенос бд со старой на новую версию
        coded by smokingplaya<3 2024
                        for austrum
*/

const start_time = performance.now();

import { Database } from "bun:sqlite";
import colors from "colors";
import path from "path";

function load_db(file): Database {
    return new Database(path.join(__dirname, `../data/server/${file}`));
}

const prefix = colors.green("|");
function log(message) {
    console.log(prefix, colors.white(message));
}

let new_db = load_db("database.sqlite");
let old_db = load_db("db.db");

/*
    how it should works:

*/

const old_users = old_db.query("SELECT * FROM users").all();
const ranks = [
    "user",
    "premium",
    "youtuber",
    "admin"
];

const premium = ranks[1];
let usernames: Array<string> = [];
let skipped = 0;

let stats = {
    users: 0,
    premium: 0
};

for (let id in old_users) {
    let user = old_users[id];
    let current_id = (parseInt(id) + 1) - skipped;

    if (usernames.includes(user.nick)) {
        skipped += 1;
        continue;
    }

    log(`Importing user #${id} \"${colors.magenta(user.nick)}\"`);

    let rank = ranks[user.status];
    let is_premium = rank == premium;

    // users migrate

    new_db.query(`INSERT INTO users(id,email,username,password,rank,blocked) VALUES(${current_id}, \"${user.email}\", \"${user.nick}\", \"\", \"${is_premium ? "user" : ranks[user.status]}\", ${0})`).run();

    stats.users += 1;

    usernames.push(user.nick);

    // migrate of premium
    if (is_premium) {
        new_db.query(`INSERT INTO purchases(userID, itemID, itemExpire) VALUES(\"${current_id}\", \"visuals\", ${user.rank_expire || 0})`).run();

        stats.premium += 1;
    }

    // hwid migrate

    if (user.hwid != null)
        new_db.query(`INSERT INTO hwids(username, hwid) VALUES(\"${user.nick}\", \"${user.hwid}\")`).run();

    if (user.discord_id != null)
        new_db.query(`INSERT INTO discord(username, discordID) VALUES(\"${user.nick}\", \"${user.discord_id}\")`).run();
}

new_db.query(`UPDATE statistics SET value=${stats.users} WHERE name="usercount";`).run();
new_db.query(`UPDATE statistics SET value=${stats.premium} WHERE name="premium";`).run();


log(`User migration completed (took ${((performance.now() - start_time) / 1000).toFixed(1)}s)`);