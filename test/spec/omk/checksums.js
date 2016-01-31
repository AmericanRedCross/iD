describe('OMK.Checksums', function () {

    it('rusha.js should hash to the same test string as OMK Android', function () {
        var r = new Rusha();
        var sha1 = r.digest('test');
        expect(sha1).to.eql('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
    });

    it('should be able to fetch OSM XML and create an array of Entities', function () {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            expect(entities.length).to.eql(6);
        });
    });

    it('tags of test way should be concatenated into the correct string for creating a checksum', function () {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            var checksums = new OMK.Checksums();
            for (var k in entities) {
                // the way
                if (entities[k].id[0] === 'w') {
                    var str = checksums._tagsAsSortedKVString(entities[k].tags);
                    expect(str).to.eql("buildingcommercialbuilding:conditiongoodbuilding:levels1building:materialconcretenameJava the Hut");
                }
            }
        });
    });

    it('checksum of the test way should equal the checksum generated for the same way in OMK Android', function () {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            var checksums = OMK.buildChecksums(entities);
            var waySha1 = checksums._idToChecksumHash.w393886820;
            expect(waySha1).to.eql("7be9866185c19bfff63029c96226105295b8ccf0");
        });
    });
});
