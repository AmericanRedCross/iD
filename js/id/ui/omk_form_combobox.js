iD.ui.OmkFormCombobox = function(context) {

    return function omkFormCombobox(selection) {

        var options = function (type) {
            var options = ['choice-1', 'choice-2', 'choice-3'];

            return options.map(function (option) {
                return {
                    title: option,
                    value: option
                };
            });
        };

        d3.xhr('http://localhost:3210/odk/formList?json=true')
            .header("X-OpenRosa-Version", "1.0")
            .get(function(err, xhr){

                if(err) {
                    return console.error(err);
                }

                // Parse the JSON in the response property
                var response = JSON.parse(xhr.response);

                // use the response to create dropdown menu items
                var options = function() {
                    return response.xforms.xform.map(function(form){
                        return {value: form.name, title: form.formID};
                    });
                };

                //  Create the dropdown
                selection
                    .append('input')
                    .attr('type', 'text')
                    .attr('class', 'omk-form')
                    .attr('id', function (d) {
                        return 'omk-form-item';
                    })
                    .each(function (d) {
                        d3.select(this)
                            .call(d3.combobox()
                                .data(options(d)));
                    });

            });

    };

};
