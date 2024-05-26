import { Database as SQLite } from "bun:sqlite"; /* classes name collision */
import path from "path";

const default_file = "database.sqlite"; /* default database file */
const cwd = process.cwd();
const binds = {
    "ID": "INTEGER PRIMARY KEY AUTOINCREMENT",
    "UniqueText": "TEXT NOT NULL UNIQUE"
};

class Database {
    private database: SQLite;
    private path: string;

    /**
     * **constructor**
     * * Метод-конструктор
     * @param file - Название файла, в который будут записываться данные.
     */

    constructor(file?: string) {
        this.path = path.join(cwd, "data/server", file || default_file);
        this.database = new SQLite(this.path);
    }

    /**
     * **CreateTable**
     * * Создает таблицу в БД, если ее не существует
     * @param name - Назвение таблицы
     * @param parameters - Колоны таблицы
     */
    CreateTable(name: string, parameters: object) {
        const params = Object.keys(parameters).map(key => {
            return binds[parameters[key]] ? key + " " + binds[parameters[key]] : key + " " + parameters[key];
        });

        this.RunQuery(`CREATE TABLE IF NOT EXISTS ${name} (${params.toString()});`);
    }

    /**
     * **RunQuery**
     * * Запускает SQL Запрос без результатов
     * @param query - SQL запрос
    */
    RunQuery(query: string) {
        this.database.query(query).run();
    }

    /**
     * **EveryQuery**
     * * Запускает SQL запрос, который возвращает все подходящие результаты.
     * * Подходит для SELECT
     * @param query - SQL запрос
     * @returns - Все подходящие результаты
     */
    EveryQuery(query: string) {
        return this.database.query(query).all();
    }

    /**
     * **GetQuery**
     * * Запускает SQL запрос, который возвращает один подходящий результат.
     * @param query - SQL запрос
     * @returns - Подходящий результат
     */
    GetQuery(query: string) {
        return this.database.query(query).get();
    }
}

export default Database;