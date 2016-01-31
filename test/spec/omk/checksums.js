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


});
