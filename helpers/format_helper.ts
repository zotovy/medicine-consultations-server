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

}

export default FormatHelper;
