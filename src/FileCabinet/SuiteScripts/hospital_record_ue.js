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

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            var record = scriptContext.newRecord;
            var val1 = record.getValue({
                fieldId: 'custrecord_wipfli_wing1_doc_no'
            });
            var val2 = record.getValue({
                fieldId: 'custrecord_wipfli_wing2_doc_no'
            });
          
            record.setValue({
                fieldId: 'custrecord_wipfli_total_doctors',
                value: val1 + val2,
                
            });

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            var currecord=scriptContext.newRecord;
            var recid=scriptContext.newRecord.id;
            var name=currecord.getValue({
                fieldId:'custrecord_wipfli_hospital_name'
            })
            record.submitFields({
                type: 'customrecord_wipfli_sudu',
                id: name,
                values: {
                    'custrecord_wipfli_hospital_id': recid
                }
            })
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
