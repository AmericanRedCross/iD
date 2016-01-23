window.OMK = {
    staging: null // singleton staging object
};

OMK.initStaging = function (entitiesFromServer) {
    return OMK.staging = new OMK.Staging(entitiesFromServer);
};

/**
 * The OMK Staging. We feed it an array of entities
 * that were fetched from an OSM submissions endpoint
 * on OpenMapKit Server.
 *
 * @param entitiesFromServer
 */
OMK.Staging = function (entitiesFromServer) {
    this._originalEntities = entitiesFromServer;
    this._newEntities = [];
};

/**
 * Provides an array of Entities that function as the base graph
 * in the history.
 * @returns {Array}
 */
OMK.Staging.prototype.baseEntities = function () {
    var originals = this._originalEntities;
    var baseEntities = [];
    for (var i = 0, len = originals.length; i < len; i++) {
        var entity = originals[i];

        // New entities shouldn't make it into the base graph,
        // the will be added via an action later.
        if (entity.isNew()) {
            this._newEntities.push(entity);
        }

        // We want to strip the tags from existing entities, because
        // we are assuming that we edited the tags. Also, by getting
        // the entity into the modify changeset, it should catch
        // geometric edits as well.
        else {
            var entityCopy = entity.copy()[0];
            var numTags = Object.keys(entity.tags).length;
            if (numTags > 0) {
                entityCopy.tags = {};
                if (typeof entity.tags.building !== 'undefined') {
                   entityCopy.tags.building = 'yes';
                }
            }
            baseEntities.push(entityCopy);
        }
    }
    return baseEntities;
};
