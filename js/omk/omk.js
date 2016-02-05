window.OMK = {};

/**
 * OpenMapKit Utility Functions
 *
 * The following are utility functions the OpenMapKit plugin need.
 *
 */

/**
 * Determines the OMK Server endpoint for
 * OSM data from the currently selected form.
 *
 * @returns {*}
 */
OMK.omkServerOsmUrl = function () {
    var q = iD.util.stringQs(location.hash.substring(1));
    var formID = q.form_id || null;
    var omkServer = q.omk_server || null;
    if(formID) {
        return (omkServer ? omkServer : window.location.origin) + '/submissions/' + formID + '.osm';
    }
    return null;
};

/**
 * This fetches an OSM XML endpoint and creates entities.
 *
 * I had to extract some logic from the source code to fetch xml and create entities, it isn't really
 * accessible publicly outside of closures.
 *
 * This is used for unit tests, but it's good to make it available for anything.
 *
 * @param url
 * @param cb -> includes entities array as parameter
 */
OMK.fetchXmlAndCreateEntities = function (url, cb) {

    d3.xml(url).get(function(err, dom) {
        var entities = parse(dom);
        cb(entities);
    });

    var ndStr = 'nd',
        tagStr = 'tag',
        memberStr = 'member',
        nodeStr = 'node',
        wayStr = 'way',
        relationStr = 'relation';

    var parsers = {
        node: function nodeData(obj) {
            var attrs = obj.attributes;
            return new iD.Node({
                id: iD.Entity.id.fromOSM('node', attrs.id.value),
                loc: getLoc(attrs),
                version: attrs.version && attrs.version.value,
                user: attrs.user && attrs.user.value,
                tags: getTags(obj),
                visible: getVisible(attrs)
            });
        },
        way: function wayData(obj) {
            var attrs = obj.attributes;
            return new iD.Way({
                id: iD.Entity.id.fromOSM('way', attrs.id.value),
                version: attrs.version && attrs.version.value,
                user: attrs.user && attrs.user.value,
                tags: getTags(obj),
                nodes: getNodes(obj),
                visible: getVisible(attrs)
            });
        },
        relation: function relationData(obj) {
            var attrs = obj.attributes;
            return new iD.Relation({
                id: iD.Entity.id.fromOSM('relation', attrs.id.value),
                version: attrs.version && attrs.version.value,
                user: attrs.user && attrs.user.value,
                tags: getTags(obj),
                members: getMembers(obj),
                visible: getVisible(attrs)
            });
        }
    };

    function parse(dom) {
        if (!dom || !dom.childNodes) return;
        var root = dom.childNodes[0],
            children = root.childNodes,
            entities = [];
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i],
                parser = parsers[child.nodeName];
            if (parser) {
                entities.push(parser(child));
            }
        }
        return entities;
    }

    function getLoc(attrs) {
        var lon = attrs.lon && attrs.lon.value,
            lat = attrs.lat && attrs.lat.value;
        return [parseFloat(lon), parseFloat(lat)];
    }

    function getNodes(obj) {
        var elems = obj.getElementsByTagName(ndStr),
            nodes = new Array(elems.length);
        for (var i = 0, l = elems.length; i < l; i++) {
            nodes[i] = 'n' + elems[i].attributes.ref.value;
        }
        return nodes;
    }

    function getTags(obj) {
        var elems = obj.getElementsByTagName(tagStr),
            tags = {};
        for (var i = 0, l = elems.length; i < l; i++) {
            var attrs = elems[i].attributes;
            tags[attrs.k.value] = attrs.v.value;
        }
        return tags;
    }

    function getMembers(obj) {
        var elems = obj.getElementsByTagName(memberStr),
            members = new Array(elems.length);
        for (var i = 0, l = elems.length; i < l; i++) {
            var attrs = elems[i].attributes;
            members[i] = {
                id: attrs.type.value[0] + attrs.ref.value,
                type: attrs.type.value,
                role: attrs.role.value
            };
        }
        return members;
    }

    function getVisible(attrs) {
        return (!attrs.visible || attrs.visible.value !== 'false');
    }
};

/**
 * Turns a string into an Uint8Array. This is useful for sending
 * unicode strings with non-ASCII characters to rusha.js
 *
 * @param s
 * @returns {Uint8Array}
 */
OMK.str2ab = function (s) {
    var escstr = encodeURIComponent(s);
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    var ua = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
        ua[i] = ch.charCodeAt(0);
    });
    return ua;
};
