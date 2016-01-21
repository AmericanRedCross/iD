iD.ui.OmkFormCombobox = function(context) {

    return function omkFormCombobox(selection) {

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
                    .attr('id', 'omkForm')
                    .each(function (d) {
                        d3.select(this)
                            .call(d3.combobox().data(options(d)));
                    })
                    .on('change', function(){

                        var selected = d3.select('#omkForm').value();
                        var result = response.xforms.xform.filter(function(form){
                            return form.name === selected;
                        });

                    });


                // Set it
                d3.select('#omkForm').value(response.xforms.xform[0].name).trigger("change")
            });

    };

};
