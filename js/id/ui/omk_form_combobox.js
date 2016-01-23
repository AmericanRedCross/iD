iD.ui.OmkFormCombobox = function(context) {

    var serverForms;

    var setState = function(formId){

        var q = iD.util.stringQs(location.hash.substring(1));

        // Clean up the form_id parameter if necessary
        if(formId == undefined){
            delete q.form_id;
        } else {
            q.form_id = formId;
        }

        location.replace('#' + iD.util.qsString(q, true));
    };

    var validateState = function(){

        var q = iD.util.stringQs(location.hash.substring(1));

        var formID =  q.form_id || null;

        var stateForm = serverForms.filter(function(form){ return form.formID === formID; });

        if(stateForm.length > 0) return stateForm[0];

        if(formID) console.error('Invalid form_id URL query parameter: ' + formID +'.')
        return false;
    };

    return function omkFormCombobox(selection) {

        d3.xhr('http://localhost:3210/formList?json=true')
            .header("X-OpenRosa-Version", "1.0")
            .get(function(err, xhr){

                var jsonResponse;

                if(err) {
                    return console.error(err);
                }

                // Parse the JSON in the response property
                jsonResponse = JSON.parse(xhr.response);

                try {
                    if (jsonResponse &&
                        (!jsonResponse.hasOwnProperty('xforms') ||
                            !jsonResponse.xforms.hasOwnProperty('xform'))){
                        throw Error;
                    }

                } catch(err) {
                    console.error("Unexpected XHR response");
                    console.error(err);
                    return;
                }

                // Check for expected response format
                if(!jsonResponse) {
                    serverForms = [];
                } else if (jsonResponse.xforms.xform instanceof Array) {

                    serverForms = jsonResponse.xforms.xform;

                } else {
                    serverForms = [jsonResponse.xforms.xform];
                }

                // use the response to create dropdown menu items
                var options = function() {
                    return serverForms.map(function(form){
                        return { value: form.name, title: form.formID };
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
                        var selectedForm = serverForms.filter(function(form){
                            return form.name === selectedItem;
                        });

                        var currentStateForm = validateState();

                        // Make sure dropdown can handle spurious type ahead combobox mistakes
                        if(selectedForm.length === 0 && serverForms.length === 0) {
                            d3.select('#omkForm').value('');
                        } else if (selectedForm.length === 0 && currentStateForm) {
                            d3.select('#omkForm').value(currentStateForm.name);
                        } else if (selectedForm.length === 0) {
                            d3.select('#omkForm').value(serverForms[0].name);
                            setState(serverForms[0].formID);
                        } else {
                            setState(selectedForm[0].formID);
                        }

                        // Load the new form submission (?)
                        context.flush();
                    });

                // Set the dropdown - either from the URL param or to the first in the form list
                var state = validateState()
                if(state){
                    d3.select('#omkForm').value(state.name).trigger("change");
                } else if (serverForms.length > 0){
                    d3.select('#omkForm').value(serverForms[0].name).trigger("change");
                } else {
                    setState();
                }
            });

    };
    
};
