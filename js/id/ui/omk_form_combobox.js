iD.ui.OmkFormCombobox = function(context) {

    return function omkFormCombobox(selection) {

        var options = function(type) {
            var options = ['choice-1', 'choice-2', 'choice-3'];

            return options.map(function(option) {
                return {
                    title: option,
                    value: option
                };
            });
        };

        selection
            .append('input')
            .attr('type', 'text')
            .attr('class', 'omk-form')
            .attr('id', function(d) {
                return 'omk-form-item';
            })
            .each(function(d) {
                d3.select(this)
                    .call(d3.combobox()
                        .data(options(d)));
            });


    };

};
