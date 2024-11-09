// Sorta functions to be reused
module.exports = {
    addSlashes: function(str) {
        // str = str.replace(/\'/g, "\\\'").replace(/\"/g, "\\\"");
        let thisVar = (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        return thisVar;
    },

    addSlashes2: function(str) {
        str = str.replace(/\\/g, '\\\\');
        str = str.replace(/\'/g, '\\\'');
        str = str.replace(/\"/g, '\\"');
        str = str.replace(/\0/g, '\\0');
        return str;
    },

    stripSlashes: function(str) {
        str = str.replace(/\\'/g, '\'');
        str = str.replace(/\\"/g, '"');
        str = str.replace(/\\0/g, '\0');
        str = str.replace(/\\\\/g, '\\');
        return str;
    },
    
    truncateString: (str, num) => {
        return (str.length > num) ? str.slice(0, num-1) + '&hellip;' : str;
    },
    
    getAppName: () => {
        return 'PSF Official Website';
    },

    trancateStr: (title, len) => {
        if (title.length > len) {
            title = title.substring(0, len)+'...';
        } return title;
    },

    removeAllHTMLs: (str) => {
        // return str.replace(/<[^>]*>?/gm, '');
        return str.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");
    },

    slugify: (str) => {
        str = str.replace(/^\s+|\s+S/g, '');
        str = str.toLowerCase();
        str = str.replace(/[^a-z0-9 -]/g, '')
                 .replace(/\s+/g, '-')
                 .replace(/-+/g, '-');
        return str;
    },
    currentDateTime: () => {
        const dt4 = new Date();
        const padLine = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
        return `${dt4.getFullYear()}-${padLine(dt4.getMonth()+1)}-${padLine(dt4.getDate())} ${padLine(dt4.getHours())}:${padLine(dt4.getMinutes())}:${padLine(dt4.getSeconds())}`;
    },
    
    currentYear: new Date().getFullYear()
}