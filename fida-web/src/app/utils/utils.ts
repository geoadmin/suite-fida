export const FORMAT_UTILS = {
    formatVersionName: (versionName: string) => {
        if (versionName) {
            const split = versionName.split('@ADB.');
            if (split.length > 1) {
                return split[split.length - 1];
            }
        }
        return versionName;
    },
    formatDateTime: (date: Date) => {
        return date.toLocaleString();
    },
    formatDate: (date: Date, format?: string) => {
        if (date == null) {
            return;
        }
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = date.getFullYear();

        switch (format) {
            case 'yyyy-mm-dd':
                return `${yyyy}-${mm}-${dd}`;
            default:
                return `${dd}.${mm}.${yyyy}`;
        }
    }
};

export const CONVERT_UTILS = {
    esriToDate: (date: any) => {
        if (date == null) {
            return undefined;
        }
        // if (typeof date.getMonth === 'function') {
        //     return date;
        // }
        return new Date(date);
    },
    dateToEsri: (date: any) => {
        if (date == null) {
            return null;
        }
        if (typeof date.getMonth === 'function') {
             return (date as Date).getMilliseconds;
        }
        return date;
    }

};