/**
 * Этот код написан на чистую, свежую, новую(???) голову
 * Поэтому тут даже есть красивенькие комментарии

    25.04.2024 19:57
*/

import { GetTime } from "./utils";

class Cooldown {
    /**
     * **Cooldown**
     * ? Время в секундах
    */

    private cooldown: number = 0;

    /**
     * **List**
     * ? Список объектов в кулдауне.
    */

    private list: object = {};

    /**
     * **constructor**
     * * Метод-конструктор
     * @param cooldown - Количество секунд перед следующим использованием.
    */

    constructor(cooldown?: number) {
        this.cooldown = cooldown;
    }

    /**
     * set **Cooldown**
     * * Устанавливает cooldown
     * @param cooldown - Количество секунд перед следующим использованием.
    */

    set Cooldown(cooldown: number) {
        this.cooldown = cooldown;
    }

    /**
     * get **Cooldown**
     * * Получает cooldown
     * @returns cooldown - Количество секунд перед следующим использованием.
    */

    get Cooldown() {
        return this.cooldown;
    }

    /**
     * **CanUse**
     * * Может ли ID что-то сделать.
     * @param canUse - Действует ли cooldown на ID. True - может использовать (нет cooldown)
    */

    CanUse(id: number | string): boolean {
        let time_current = GetTime();

        if (time_current < (this.list[id] || 0))
            return false;

        this.list[id] = time_current + this.cooldown;

        return true;
    }
}

export default Cooldown;