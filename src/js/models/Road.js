class RoadCache {
    constructor(offset) {
        this.offset = offset;
        this.prev = {};
        this.current = {};
        this.next = {};
    }

    /* updateFor(date_current) 
     *  1) находимся на current странице - ничего не делать
     *  2) находимся в prev/next стринице - смещаем страницы назад/вперед 
     *  (текущая становится предыдущей/следующей, предыдущая/следующая - текущей, прошлая/следующая - подгружается с бд)
     *  3) находимся за пределами prev/next страниц - полный rebuild кэша 
     * */

    /* Возможнные запросы (очень примерно)
     *  select * from events
     *  where date between date({current}, "- {offset}") and {current};
     *  select * from events
     *  where date between {current} and date({current}, "+ {offset}");
     *  select * from events
     *  where date between date({current}, "+ {offset}") and date({current}, "+ {2 * offset}");
     */
}



class Road {
/* 
 *  offset - длина дороги
 *  setYear(year) - установить начало дороги
 *  forward() - передвинуть вперед
 *  backward() - передвинуть назад
 *  * три метода сверху могут вызвать updateFor кэш-объекта
 *
 *  getChildRoads() - получить дочерние дороги
 *  getCurrentEvents() - получить текущие события (видимые пользователем)
 *      получаем события. какая-то часть будет с текущей страницы кэша, какая-то с предыдущей/следующей
 *      так как это разные массивы, придумать логику объединения или вроде-того (на стороне кжша лучше сделать метод)
 *  
 * */
}
