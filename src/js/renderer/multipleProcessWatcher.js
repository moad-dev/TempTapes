// Вспомогательный модуль для отслеживания процесса выполнения множества событий.
//
//

module.exports =
    class Watcher {
        flags = []
        constructor(size)
        {
            for(let i = 0; i < size; i++)
                this.flags.push(false);
        }
        set_status(value)
        {
            for(let i = 0; i < this.flags.length; i++)
                this.flags[i] = value;
        }
        any_running()
        {
            for(let i = 0; i < this.flags.length; i++)
                if(this.flags[i] == true)
                    return true;
            return false;
        }
        any_completed()
        {
            for(let i = 0; i < this.flags.length; i++)
                if(this.flags[i] == false)
                    return false;
            return true;
        }
        process_complete(index)
        {
            try
            {
                this.flags[index] = false;
            }
            catch
            {
                console.log("error: process watcher, wrong index");
            }
        }
    };
