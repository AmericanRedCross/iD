window.OMK = {};

OMK.buildStaging = function (context, result) {
    var staging = new OMK.Staging(result.data);
    context.history().merge(staging.baseEntities(), result.extent);
    staging.stageTags(context);
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
    this._baseEntitiesWithTags = [];
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
        // Existing entities should go into base graph.
        else {
            baseEntities.push(entity);
            // To stage all the possible tag edits, we keep track of
            // entites with tags and perform a change action later.
            if (Object.keys(entity.tags).length > 0) {
                this._baseEntitiesWithTags.push(entity);
            }
        }
    }
    return baseEntities;
};

OMK.Staging.prototype.stageTags = function (context) {
    for (var i = 0, len = this._baseEntitiesWithTags.length; i < len; i++) {
        var entity = this._baseEntitiesWithTags[i];
        context.perform(iD.actions.ChangeTags(entity.id, entity.tags));
    }
};
