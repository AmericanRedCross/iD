OMK.buildChecksums = function (entitiesFromServer) {
    return OMK.checksums = new OMK.Checksums(entitiesFromServer);
};

OMK.Checksums = function (entitiesFromServer) {
    this._entityHash = {};
    this._idToChecksumHash = {};
    this._rusha = new Rusha();

    if (typeof entitiesFromServer !== 'object' || typeof entitiesFromServer.length !== 'number') {
        return;
    }

    for (var i = 0, len = entitiesFromServer.length; i < len; i++) {
        var entity = entitiesFromServer[i];
        this._entityHash[entity.id] = entity;
        if (entity.id[0] === 'n') {
            this._generateNodeChecksum(entity);
        }
    }
    // We generate the way checksums after we're done with the node checksums,
    // because a way checksum includes refs to node checksums.
    for (var id in this._entityHash) {
        if (id[0] === 'w') {
           this._generateWayChecksum(this._entityHash[id]);
        }
    }
    //for (var id in this._entityHash) {
    //    if (id[0] === 'r') {
    //        this._generateRelationChecksum(this._entityHash[id]);
    //    }
    //}
};

OMK.Checksums.prototype.patchChecksumsToOMKServer = function (diffResultXml) {
    var checksums = [];
    var entities = diffResultXml.children[0].children;
    for (var i = 0, len = entities.length; i < len; i++) {
        var entity = entities[i];
        var typeChar = entity.nodeName[0];
        var oldId = entity.attributes.old_id.value;
        var id = typeChar + oldId;
        var checksum = this._idToChecksumHash[id];
        checksums.push(checksum);
    }
    var json = JSON.stringify({finalizedOsmChecksums: checksums});

    d3.xhr(OMK.omkServerOsmUrl())
        .mimeType('application/json')
        .header('Content-Type', 'application/json')
        .response(function (xhr) {
            return JSON.parse(xhr.responseText);
        })
        .send('PATCH', json, function (err, data) {
            console.log(err || data);
        });

};

OMK.Checksums.prototype._generateNodeChecksum = function (entity) {
    var str = this._tagsAsSortedKVString(entity.tags);
    str += entity.loc[1]; // lat
    str += entity.loc[0]; // lng
    this._idToChecksumHash[entity.id] = this._rusha.digest(str);
};

OMK.Checksums.prototype._generateWayChecksum = function (entity) {
    var str = this._preWayChecksumStr(entity);
    this._idToChecksumHash[entity.id] = this._rusha.digest(str);
};

OMK.Checksums.prototype._preWayChecksumStr = function (entity) {
    var str = this._tagsAsSortedKVString(entity.tags);
    for (var i = 0, len = entity.nodes.length; i < len; i++) {
        var id = entity.nodes[i];
        var sha1 = this._idToChecksumHash[id];
        str += sha1;
    }
    return str;
}

//OMK.Checksums.prototype._generateRelationChecksum = function (entity) {
//    var str = this._tagsAsSortedKVString(entity.tags);
//    for (var i = 0, len = entity.members.length; i < len; i++) {
//        var member = entity.members[i];
//        // a relation might have a relation in it, and we might not have that checksum yet
//        if (member.id[0] === 'r' && typeof member.checksum !== 'string') {
//           this._generateRelationChecksum(member);
//        }
//
//    }
//    entity.checksum = this._rusha.digest(str);
//};

OMK.Checksums.prototype._tagsAsSortedKVString = function (tags) {
    var keys = Object.keys(tags).sort();
    var tagsStr = '';
    for (var i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        tagsStr += k + tags[k];
    }
    return tagsStr;
};
