import Database from "../database";
import { SQLSafe } from "../utils";

const database = new Database();
database.CreateTable("statistics", {
    "name": "TEXT NOT NULL",
    "value": "INT NOT NULL"
});

let statistics = {};

let statistic = {
    Register: (name: string) => {
        statistics[name] = 0;

        let result = database.GetQuery(`SELECT * FROM statistics WHERE name=${SQLSafe(name)}`);

        if (result == null || result.value == null)
            return database.RunQuery(`INSERT INTO statistics VALUES(${SQLSafe(name)}, "0")`);

        statistics[name] = result.value;
    },

    Plus: (name: string) => {
        statistics[name]++;

        database.RunQuery(`UPDATE statistics SET value=${SQLSafe(statistics[name])} WHERE name=${SQLSafe(name)}`);
    },

    GetAll: (): Object => {
        return statistics;
    },

    Get: (name: string) => {
        return statistics[name];
    }
};

export default statistic;