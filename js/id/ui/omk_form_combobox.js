iD.ui.OmkFormCombobox = function(context) {

    var setState = function(formId){

        var q = iD.util.stringQs(location.hash.substring(1));

        q.form_id = formId;

        location.replace('#' + iD.util.qsString(q, true));

    };

    var getState = function(){

        var q = iD.util.stringQs(location.hash.substring(1));

        return q.form_id || null;
    };

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

                        // Grab selected dropdown item
                        var selectedItem = d3.select('#omkForm').value();

                        // Get the Form ID
                        var selectedForm = response.xforms.xform.filter(function(form){
                            return form.name === selectedItem;
                        });

                        // Adjust the URL with the selected  form ID
                        setState(selectedForm[0].formID);

                        // Load the new form submission (?)
                        context.loadTiles(context.projection, [1,1]);
                    });

                // Set the dropdown - either from the URL param or to the first in the form list
                var onloadState = getState();
                var stateForm = response.xforms.xform.filter(function(form){
                    return form.formID === onloadState;
                });

                if(onloadState && stateForm.length > 0){
                    d3.select('#omkForm').value(stateForm[0].name).trigger("change");
                } else {
                    d3.select('#omkForm').value(response.xforms.xform[0].name).trigger("change");
                }
            });

    };


};
