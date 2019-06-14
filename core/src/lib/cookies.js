// From https://stackoverflow.com/a/19189846/562947

module.exports.getCookie = function getCookie(key) {
    const cookies = document.cookie.split(';');
    for(const cookie of cookies)
    {
        const oPair = cookie.split('=');
        const sKey = decodeURIComponent(oPair[0].trim().toLowerCase());
        const sValue = oPair.length > 1 ? oPair[1] : '';
        if(sKey == key.toLowerCase()) {
            return decodeURIComponent(sValue);
        }
    }
    return '';
}

module.exports.setCookie = function setCookie(sName, sValue) {
    const oDate = new Date();
    oDate.setYear(oDate.getFullYear() + 1);
    const sCookie = encodeURIComponent(sName) + '=' + encodeURIComponent(sValue)
        + ';expires=' + oDate.toGMTString() + ';path=/';
    document.cookie= sCookie;
}

module.exports.clearCookie = function clearCookie(sName) {
    this.setCookie(sName,'');
}
