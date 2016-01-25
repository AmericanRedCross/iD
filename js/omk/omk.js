window.OMK = {};

OMK.omkServerOsmUrl = function () {
    var q = iD.util.stringQs(location.hash.substring(1));
    var formID = q.form_id || null;
    var omkServer = q.omk_server || null;
    if(formID) {
        return (omkServer ? omkServer : window.location.origin) + '/submissions/' + formID + '.osm';
    }
    return null;
};
