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
        var pagemode;

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
            pagemode = scriptContext.mode;

            if (pagemode === 'view') {
                var record = scriptContext.currentRecord;
                var currentDate = new Date();
                log.debug("current dateeee", currentDate);
                var expireDate = record.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                    fieldId: 'custrecord_wipfli_medicine_expire_date'
                });
                log.debug("expire dateeeee", expireDate);
                if (expireDate) {
                    expireDate = new Date(expireDate);
                    log.debug("expire date", expireDate);
                    if (expireDate < currentDate) {
                        alert("Your medicine is expired");
                        return false;
                    }
                    return true;
                }
            }

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

            var Phone = record.getField({
                fieldId: 'custrecord_wipfli_patient_pno'
            });
            var address = record.getField({
                fieldId: 'custrecord_wipfli_patient_addres'
            });

            if (dob && Phone.isDisabled == true) {
                Phone.isDisabled = false;
            } else {
                Phone.isDisabled = true;
            }

            var email = record.getValue({
                fieldId: 'custrecord_wipfli_patient_mail'
            });


            var firstName = record.getValue({
                fieldId: 'custrecord_wipfli_patient_first_name'
            });

            var secondName = record.getValue({
                fieldId: 'custrecord_wipfli_patient_second_name'
            });

            record.setValue({
                fieldId: 'custrecord_wipfli_patient_full_name',
                value: firstName + " " + secondName,
                ignoreFieldChange: true
            });

            var dateOfBirth = record.getValue({
                fieldId: 'custrecord_wipfli_patient_dateob'
            });

            var today = new Date();  
            var date = new Date(dateOfBirth);
            var patientAge = today.getFullYear() - date.getFullYear();

            record.setValue({
                fieldId: 'custrecord_wipfli_patient_age',
                value: patientAge,
                ignoreFieldChange: true
            });

            if (scriptContext.fieldId == 'custrecord_wipfli_medicine_quantity') {
                var price = record.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                    fieldId: 'custrecord_wipfli_medicine_price'
                });

                var quantity = record.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                    fieldId: 'custrecord_wipfli_medicine_quantity'
                });

                var totalPrice = price * quantity;
                record.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                    fieldId: 'custrecord_wipfli_medicine_total_price',
                    value: totalPrice
                });
            }
        }
        function saveRecord(scriptContext) {
            var record = scriptContext.currentRecord;
            var sublistCount = record.getLineCount({
                sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient'
            });
            log.debug("sublist", sublistCount);
            if (sublistCount === 0) {
                alert("There need be atleast one Medicine list");
                return false;
            }

            validateEmail(scriptContext);

            if (pagemode === 'create') {
                return searchForDuplicates(scriptContext);
            } else {
                return true;
            }
        }

        function validateEmail(scriptContext) {
            var record = scriptContext.currentRecord;
            var email = record.getValue({
                fieldId: 'custrecord_wipfli_patient_mail'
            });
            if (!email) {
                alert("please enter the Email");
                return false;
            }
        }

        function searchForDuplicates(scriptContext) {
            var record = scriptContext.currentRecord;
            var fullname = record.getValue({
                fieldId: 'custrecord_wipfli_patient_full_name'
            });

            var patientSearch = search.create({
                type: "customrecord_wipfli_patient_record",
                filters:
                    [
                        ["custrecord_wipfli_patient_full_name", "is", fullname]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "scriptid",
                            sort: search.Sort.ASC,
                            label: "Script ID"
                        }),
                        search.createColumn({ name: "custrecord_wipfli_patient_full_name", label: "Patient Full name" }),
                    ]
            });
            var searchResultCount = patientSearch.runPaged().count;
            log.debug("count value", searchResultCount);
            if (searchResultCount > 0) {
                alert("The patient name is already exist");
                return false;
            }
            return true;
        }

        function validateField(scriptContext) {
            if (pagemode === 'create') {
                var record = scriptContext.currentRecord;
                var currentDate = new Date();
                var expireDate = record.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                    fieldId: 'custrecord_wipfli_medicine_expire_date'
                });

                if (expireDate) {
                    expireDate = new Date(expireDate);

                    if (expireDate < currentDate) {
                        alert("Your medicine is expired");
                        record.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                            fieldId: 'custrecord_wipfli_medicine_expire_date',
                            value: ''
                        });
                        return false;
                    }
                    return true;
                }
            }

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

        function autopopulate() {
            var currRec = curRec.get();

            var doctor = currRec.getValue({
                fieldId: 'custrecord_wipfli_patient_doctor_name'
            });

            var customrecord_wipfli_patient_recordSearchObj = search.create({
                type: "customrecord_wipfli_doctor_record",
                filters:
                    [
                        ["internalid", "is", doctor]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_wipfli_doctor_pno", label: "Doc mob no" }),
                        search.createColumn({ name: "custrecord_wipfli_doctor_email", label: "Doc email" })
                    ]
            });

            var docdetails = customrecord_wipfli_patient_recordSearchObj.run();
            var searchObject = docdetails.getRange(0, 1000);
            if (searchObject.length > 0) {
                var docPno = searchObject[0].getValue({
                    name: "custrecord_wipfli_doctor_pno"
                });
                var docEmail = searchObject[0].getValue({
                    name: "custrecord_wipfli_doctor_email"
                });

                currRec.setValue({
                    fieldId: 'custrecord_wipfli_patient_doctor_pno',
                    value: docPno
                });

                currRec.setValue({
                    fieldId: 'custrecord_wipfli_patient_doctor_email',
                    value: docEmail
                });
            }
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            validateField: validateField,
            autopopulate: autopopulate
        };
    });
