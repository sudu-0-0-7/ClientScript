/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
    /**
     * @param{record} record
     */
    function (record) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            alert("Srilaxmi");
            console.log("hello");
            var myRec = scriptContext.currentRecord;
            var Phone = myRec.getField({
                fieldId: 'custrecord_wipfli_patient_no'
            });
            Phone.isDisabled = true;
        }

        function fieldChanged(scriptContext) {
            var record = scriptContext.currentRecord;
            var dob = record.getValue({
                fieldId: 'custrecord_wipfli_patient_dob'
            });
            var email = record.getValue({
                fieldId: 'custrecord_wipfli_patient_email'
            });
            var Phone = record.getField({
                fieldId: 'custrecord_wipfli_patient_no'
            });
            var address = record.getField({
                fieldId: 'custrecord_wipfli_patient_address'
            });
            if (dob && Phone.isDisabled == true) {
                Phone.isDisabled = false;
            }
            else {
                Phone.isDisabled = true;
            }
           
            if(scriptContext.fieldId=='custrecord_wipfli_patient_email')
            {
                record.setValue({
                    fieldId:'custrecord_wipfli_patient_address',
                    value:''
                })

            }
        }
        function saveRecord(scriptContext) {
            var record = scriptContext.currentRecord;
            var email = record.getValue({
                fieldId: 'custrecord_wipfli_patient_email'
            });

            if (!email) {
                alert("please enter the Email");
                return false;
            }
            else {

                return true;
            }

        }

        function validateField(scriptContext) {
            try{
                var recordvalue = scriptContext.currentRecord;
                if (scriptContext.fieldId == 'custrecord_wipfli_patient_name') {
                    var name = recordvalue.getValue({
                        fieldId: 'custrecord_wipfli_patient_name'
                    });
                    if(name) {
                        if((name.length < 3) || (name.length > 20)) {
                            alert("Enter Proper Name");
                            recordvalue.setValue({
                                fieldId: 'custrecord_wipfli_patient_name',
                                value: "",
                                ignoreFieldChange: true
                            });
                            return false;
                        }
                    }
                 
                }
            } catch(e) {
                log.error("error in validate filed",e.message);
                return false;
            }
         
            return true;

        }



        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            validateField: validateField
        };

    });
