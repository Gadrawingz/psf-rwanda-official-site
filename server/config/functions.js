// Sorta functions to be reused
module.exports = {
    addSlashes: function(str) {
        // str = str.replace(/\'/g, "\\\'").replace(/\"/g, "\\\"");
        let thisVar = (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        return thisVar;
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
    currentYear: new Date().getFullYear()
}