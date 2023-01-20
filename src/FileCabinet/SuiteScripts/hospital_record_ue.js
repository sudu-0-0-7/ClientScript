/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            var record = scriptContext.newRecord;
            if(scriptContext.type == 'create')
            {
            scriptContext.form.addButton({
                id: 'custpage_wipfli_button',
                label: 'Alert',
                functionName: 'alert("Please fill all details")'
                 });
            }

        }

       

           
            //  log.debug("customrecord_wipfli_patient_recordSearchObj result count",searchResultCount);
            //  customrecord_wipfli_patient_recordSearchObj.run().each(function(result){
            //     // .run().each has a limit of 4,000 results
            //     return true;
            //  });
             
             /*
             customrecord_wipfli_patient_recordSearchObj.id="customsearch1674209294713";
             customrecord_wipfli_patient_recordSearchObj.title="Custom PATIENT Search (copy)";
             var newSearchId = customrecord_wipfli_patient_recordSearchObj.save();
             */
        

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
    

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
    
        return {beforeLoad//, beforeSubmit, afterSubmit
    }

    });
