OMK.buildChecksums = function (entitiesFromServer) {
    OMK.checksums = new OMK.Checksums(entitiesFromServer);
};

OMK.Checksums = function (entitiesFromServer) {
    this.entityHash = {};
    for (var i = 0, len = entitiesFromServer.length; i < len; i++) {
        var entity = entitiesFromServer[i];
        this.entityHash[entity.id] = entity;
        if (entity.id[0] === 'n') {
            this.generateNodeChecksum(entity);
        }
    }
    // We generate the way checksums after we're done with the node checksums,
    // because a way checksum includes refs to node checksums.
    for (var id in this.entityHash) {
        if (id[0] === 'w') {
           this.generateWayChecksum(this.entityHash[id]);
        }
    }
};

OMK.Checksums.prototype.generateNodeChecksum = function (entity) {
    
};

OMK.Checksums.prototype.generateWayChecksum = function (entity) {

};

OMK.Checksums.prototype.patchChecksumsToOMKServer = function (diffResultXml) {

};

