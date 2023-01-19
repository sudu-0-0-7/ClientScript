/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/currentRecord', 'N/search'],
    /**
     * @param{record} record
     */
    function (record, curRec, search) {


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

            var myRec = scriptContext.currentRecord;
            var Phone = myRec.getField({
                fieldId: 'custrecord_wipfli_patient_pno'
            });
            Phone.isDisabled = true;
        }

        function fieldChanged(scriptContext) {
            var record = scriptContext.currentRecord;
            var dob = record.getValue({
                fieldId: 'custrecord_wipfli_patient_dateob'
            });
            var email = record.getValue({
                fieldId: 'custrecord_wipfli_patient_mail'
            });
            var Phone = record.getField({
                fieldId: 'custrecord_wipfli_patient_pno'
            });
            var address = record.getField({
                fieldId: 'custrecord_wipfli_patient_addres'
            });
            if (dob && Phone.isDisabled == true) {
                Phone.isDisabled = false;
            }
            else {
                Phone.isDisabled = true;
            }

            if (scriptContext.fieldId == 'custrecord_wipfli_patient_mail') {
                record.setValue({
                    fieldId: 'custrecord_wipfli_patient_addres',
                    value: ''
                })

            }

            var firstName = record.getValue({
                fieldId: 'custrecord_wipfli_patient_first_name'
            });

            var secondName = record.getValue({
                fieldId: 'custrecord_wipfli_patient_second_name'
            });

            record.setValue({
                fieldId: 'custrecord_wipfli_patient_full_name',
                value: firstName+ " " + secondName,
                ignoreFieldChange: true
            });



        }
        function saveRecord(scriptContext) {
            var record = scriptContext.currentRecord;
            var email = record.getValue({
                fieldId: 'custrecord_wipfli_patient_mail'
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
            try {
                var recordvalue = scriptContext.currentRecord;
                if (scriptContext.fieldId == 'custrecord_wipfli_patient_first_name' || scriptContext.fieldId == 'custrecord_wipfli_patient_second_name') {
                    var firstName = recordvalue.getValue({
                        fieldId: 'custrecord_wipfli_patient_first_name'
                    });
                    var secondName = recordvalue.getValue({
                        fieldId: 'custrecord_wipfli_patient_second_name'
                    });

                    if (firstName) {
                        if ((firstName.length < 3) || (firstName.length > 20)) {
                            alert("Enter Proper Name");
                            recordvalue.setValue({
                                fieldId: 'custrecord_wipfli_patient_first_name',
                                value: "",
                                ignoreFieldChange: true
                            });
                            return false;
                        }
                    }
                    if (secondName) {
                        if (secondName.length > 20) {
                            alert("Enter Proper Name");
                            recordvalue.setValue({
                                fieldId: 'custrecord_wipfli_patient_second_name',
                                value: "",
                                ignoreFieldChange: true
                            });
                            return false;
                        }
                    }

                }
            } catch (e) {
                log.error("error in validate filed", e.message);
                return false;
            }
            return true;
        }

        function Autopopulate() {

            var currRec = curRec.get();

            var doctor = currRec.getValue({
                fieldId: 'custrecord_wipfli_patient_doctor_name'
            });

            var lookupDocord = search.lookupFields({
                type: 'customrecord_wipfli_doctor_record',
                id: doctor,
                columns: ['custrecord_wipfli_doctor_pno', 'custrecord_wipfli_doctor_email']
            });

            var docPno = lookupDocord['custrecord_wipfli_doctor_pno'];
            var docEmail = lookupDocord['custrecord_wipfli_doctor_email'];

            currRec.setValue({
                fieldId: 'custrecord_wipfli_patient_doctor_pno',
                value: docPno
            });

            currRec.setValue({
                fieldId: 'custrecord_wipfli_patient_doctor_email',
                value: docEmail
            });

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            validateField: validateField,
            Autopopulate: Autopopulate
        };

    });
