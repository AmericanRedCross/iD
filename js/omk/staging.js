/**
 * Builds a staging of edits from OpenMapKit Server by creating
 * a history that begins with base entities, performs tag edit
 * modifications to all of the existing entities, and then
 * adds all of the new entities. This puts the model in the correct
 * state to create a changeset that can be submitted.
 *
 * @param context
 * @param result
 */
OMK.buildStaging = function (context, result) {
    var staging = new OMK.Staging(result.data);
    context.history().merge(staging.baseEntities(), result.extent);
    staging.stageTags(context);
    staging.stageNewEntities(context);
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
    this._tagHash = {};
};

/**
 * Provides an array of Entities that function as the base graph
 * in the history.
 *
 * @returns {Array} of base entities
 */
OMK.Staging.prototype.baseEntities = function () {
    var originals = this._originalEntities;
    var baseEntities = [];
    for (var i = 0, len = originals.length; i < len; i++) {
        var entity = originals[i];

        // New entities shouldn't make it into the base graph,
        // they will be added via an action later.
        if (entity.isNew()) {
            this._newEntities.push(entity);
        }
        // Existing entities should go into base graph.
        else {
            // The base graph will not have any tags. We stage tags when performing an action
            // so that the tag modifications make it into the history of graphs.
            if (Object.keys(entity.tags).length > 0) {
                this._tagHash[entity.id] = entity.tags; // object keeping track of tags for entity id
                entity.tags = {}; // no tags in base graph
            }
            baseEntities.push(entity);
        }
    }
    return baseEntities;
};

/**
 * Performs a change tag action on all of the existing entities with tags.
 *
 * @param context from id.js
 */
OMK.Staging.prototype.stageTags = function (context) {
    for (var id in this._tagHash) {
        context.perform(iD.actions.ChangeTags(id, this._tagHash[id]));
    }
};

OMK.Staging.prototype.stageNewEntities = function (context) {
    for (var i = 0, len = this._newEntities.length; i < len; i++) {
        context.perform(iD.actions.AddEntity(this._newEntities[i]));
    }
};
