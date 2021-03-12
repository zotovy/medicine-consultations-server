class FormatHelper {

    // Return formatted fullName by received name, surname & patronymic
    static fullName = (obj: { name?: string, surname?: string, patronymic?: string}) => {
        let fullName = "";
        if (typeof obj.name == "string" && obj.name.length > 0) fullName += `${obj.name} `;
        if (typeof obj.surname == "string" && obj.surname.length > 0) fullName += `${obj.surname} `;
        if (typeof obj.patronymic == "string" && obj.patronymic.length > 0) fullName += `${obj.patronymic} `;

        if (fullName.length > 0) fullName = fullName.substring(0, fullName.length - 1);
        return fullName;
    }

    /// Return formatted time in MM:HH format
    static time = (date: Date): string => {
        let minutes = date.getMinutes().toString(),
            hours = date.getHours().toString();
        if (minutes.length === 1) minutes = "0" + minutes;
        if (hours.length === 1) hours = "0" + hours;
        return `${minutes}:${hours}`;
    }

    public static getNumEnding = (num: number, ending: [string, string, string]): string => {
        const last2 = num % 100;
        if (last2 >= 11 && last2 <= 19) return ending[2];

        const last = num % 10;
        switch (last) {
            case (1):
                return ending[0];
            case (2):
            case (3):
            case (4):
                return ending[1];
            default:
                return ending[2]
        }
    }

    static formatDayAndMonth = (day: number, month: number) : string => {
        const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "Декабря"];
        return `${day} ${months[month - 1]}`;
    }

    static formatDate(date: Date, casing: string = "ИП"): string {
        let minutes = date.getMinutes().toString(),
            hours = date.getHours().toString();

        if (minutes.length === 1) minutes = "0" + minutes;
        if (hours.length === 1) hours = "0" + hours;

        const dayAndMonth = FormatHelper.formatDayAndMonth(date.getDate(), date.getMonth());
        return `${dayAndMonth} в ${hours}:${minutes}`;
    }
}

export default FormatHelper;
