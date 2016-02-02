describe('OMK.Checksums', function () {

    it('rusha.js should hash to the same test string as OMK Android', function () {
        var r = new Rusha();
        var sha1 = r.digest('test');
        expect(sha1).to.eql('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
    });

    it('should be able to fetch OSM XML and create an array of Entities', function (done) {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            expect(entities.length).to.eql(6);
            done();
        });
    });

    it('tags of test way should be concatenated into the correct string for creating a checksum', function (done) {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            var checksums = new OMK.Checksums();
            for (var k in entities) {
                // the way
                if (entities[k].id[0] === 'w') {
                    var str = checksums._tagsAsSortedKVString(entities[k].tags);
                    expect(str).to.eql("buildingcommercialbuilding:conditiongoodbuilding:levels1building:materialconcretenameJava the Hut");
                    done();
                }
            }
        });
    });

    it('checksums of nodes in test way should equal checksums in OMK Android', function (done) {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            var hash = OMK.buildChecksums(entities)._idToChecksumHash;
            expect(hash.n3969314187).to.equal('6f3b2e85e05dbdc496f9250931693f7a3e427807');
            expect(hash.n3969314188).to.equal('e52eb00f4e028a8010e32a9cfca788273f49a675');
            expect(hash.n3969314189).to.equal('3f7514c1b2ca88dfc53fdd7daecc0851bfeba081');
            expect(hash.n3969314190).to.equal('c3010e77a9f5d322bfd0081c607dfc7109b86ba9');
            done();
        });
    });

    it('should have the same pre-hash checksum string in the way as in OMK Android', function (done) {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            var way = OMK.buildChecksums(entities)._entityHash.w393886820;
            var checksumStr = OMK.checksums._preWayChecksumStr(way);
            expect(checksumStr).to.equal('buildingcommercialbuilding:conditiongoodbuilding:levels1building:materialconcretenameJava the Hut6f3b2e85e05dbdc496f9250931693f7a3e427807c3010e77a9f5d322bfd0081c607dfc7109b86ba93f7514c1b2ca88dfc53fdd7daecc0851bfeba081e52eb00f4e028a8010e32a9cfca788273f49a6756f3b2e85e05dbdc496f9250931693f7a3e427807');
            done();
        });
    });

    it('checksum of the test way should equal the checksum generated for the same way in OMK Android', function (done) {
        OMK.fetchXmlAndCreateEntities('data/checksum_way.xml', function (entities) {
            var checksums = OMK.buildChecksums(entities);
            var waySha1 = checksums._idToChecksumHash.w393886820;
            expect(waySha1).to.eql("7be9866185c19bfff63029c96226105295b8ccf0");
            done();
        });
    });
});
