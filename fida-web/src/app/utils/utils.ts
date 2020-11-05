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
    formatDate: (date: Date) => {
        return date.toLocaleString();
    }
};