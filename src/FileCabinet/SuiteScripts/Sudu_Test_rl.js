/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 */
    (record, search) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {
            try {
                var patientId = requestParams.id;
                var patientName = requestParams.name;
                var filter = [];
                if (!isEmpty(patientName)) {
                    filter.push(["custrecord_wipfli_patient_full_name", "contains", patientName]);
                } else {
                    filter.push(["internalid", "is", patientId]);
                }

                //This is additional filter validation practice should be removed later
                //filter.push("AND", [["custrecord_wipfli_medicine_ref_patient.name", "contains", "dolo"]]);
                //Patient search to check for the enterted ID is there in patient record or not
                var searchPatient = search.create({
                    type: "customrecord_wipfli_patient_record",
                    filters: filter,
                    columns:
                        [
                            search.createColumn({ name: "custrecord_wipfli_patient_full_name" }),
                            search.createColumn({ name: "custrecord_wipfli_patient_age" }),
                            search.createColumn({ name: "custrecord_wipfli_patient_mail" }),
                            search.createColumn({ name: "custrecord_wipfli_patient_dateob" }),
                            search.createColumn({ name: "custrecord_wipfli_patient_pno" }),
                            search.createColumn({ name: "custrecordcustrecord_wipfli_patient_addr" }),
                            search.createColumn({ name: "custrecord_wipfli_patient_doctor_name" })
                        ]
                });
                var searchResultCount = searchPatient.runPaged().count;
                if (searchResultCount > 0) {
                    var patientdetails = searchPatient.run();
                    var searchObject = patientdetails.getRange(0, 1000);
                    var patientData = [];
                    for (var i = 0; i < searchObject.length; i++) {
                        patientName = searchObject[i].getValue({
                            name: "custrecord_wipfli_patient_full_name"
                        });
                        var patientAge = searchObject[i].getValue({
                            name: "custrecord_wipfli_patient_age"
                        });
                        var patientEmail = searchObject[i].getValue({
                            name: "custrecord_wipfli_patient_mail"
                        });
                        var patientDateOfBirth = searchObject[i].getValue({
                            name: "custrecord_wipfli_patient_dateob"
                        });
                        var patientPhoneNumber = searchObject[i].getValue({
                            name: "custrecord_wipfli_patient_pno"
                        });
                        var patientAddress = searchObject[i].getValue({
                            name: "custrecordcustrecord_wipfli_patient_addr"
                        });
                        var patientDoctorName = searchObject[i].getValue({
                            name: "custrecord_wipfli_patient_doctor_name"
                        });


                        patientData.push({
                            'Patient Name': patientName,
                            'Patient Age': patientAge,
                            'Patient Email': patientEmail,
                            'Patient Date of Birth': patientDateOfBirth,
                            'Patient Phone Number': patientPhoneNumber,
                            'Patient Address': patientAddress,
                            'Patient Doctor Name': patientDoctorName
                        });
                    }
                    return patientData;
                } else {
                    return "The given Id or name was not found in Patient record";
                }
            } catch (e) {
                log.debug({
                    title: "Error in get function",
                    details: e.message
                });
                return e.message;
            }
            function isEmpty(value) { return value === '' || value === null || value === undefined; }
        };

        const post = (requestBody) => {
            try {
                for (var i = 0; i < requestBody.length; i++) {
                    var data = requestBody[i];

                    //creating JSON to check for mandatory fields in patient record
                    var PatientJson = {
                        "firstName": "",
                        "lastName": "",
                        "email": "",
                        "phoneNumber": "",
                        "dateOfBirth": "",
                        "address": "",
                        "doctorName": "",
                        "medicine": ""
                    };
                    var firstName = requestBody[i].firstName;
                    log.debug("firstname", firstName);
                    var lastName = requestBody[i].lastName;
                    var fullname = firstName + ' ' + lastName;
                    //patient search for check duplicate names
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
                    if (searchResultCount > 0) {
                        return "The patient name is already exist";
                    }
                    //cheching for madatory fields in patient record
                    var checkPatientEmptyFields;
                    Object.keys(PatientJson).forEach(function (key) {
                        if (isEmpty(data[key])) {
                            checkPatientEmptyFields = `Please enter ${key}`;
                            return false;
                        }
                    });
                    if (!isEmpty(checkPatientEmptyFields)) {
                        return checkPatientEmptyFields;
                    }
                    var patientRecCreate = createPatient(data);
                }
                return patientRecCreate;
            } catch (e) {
                log.error("error in post", e.message);
                return e.message;
            }
            function isEmpty(value) { return value === '' || value === null || value === undefined; }
            
            //function to create patient record
            function createPatient(requestBody) {
                try {
                    var firstName = requestBody.firstName;
                    log.debug("first name in function", firstName);
                    var lastName = requestBody.lastName;
                    var email = requestBody.email;
                    var phoneNumber = requestBody.phoneNumber;
                    var dateOfBirth = requestBody.dateOfBirth;
                    var patientDateOfBirth = new Date(dateOfBirth);
                    var address = requestBody.address;
                    var doctorName = requestBody.doctorName;

                    var patientRecord = record.create({
                        type: 'customrecord_wipfli_patient_record',
                        isDynamic: false,
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_first_name',
                        value: firstName
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_second_name',
                        value: lastName,
                        ignoreFieldChange: false
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_full_name',
                        value: firstName + ' ' + lastName
                    });

                    var today = new Date();
                    var date = new Date(dateOfBirth);
                    var patientAge = today.getFullYear() - date.getFullYear();

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_age',
                        value: patientAge
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_dateob',
                        value: patientDateOfBirth
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_pno',
                        value: phoneNumber
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_mail',
                        value: email
                    });

                    patientRecord.setValue({
                        fieldId: 'custrecordcustrecord_wipfli_patient_addr',
                        value: address
                    });

                    patientRecord.setText({
                        fieldId: 'custrecord_wipfli_patient_doctor_name',
                        text: doctorName,
                        ignoreFieldChange: true
                    });
                    var medicine = requestBody.medicine;
                    for (var j = 0; j < medicine.length; j++) {
                        var name = medicine[j].name;
                        var price = medicine[j].price;
                        var quantity = medicine[j].quantity;
                        var expDate = medicine[j].expDate;
                        var expireDate = new Date(expDate);

                        //checking for mandatory fields in medicine record
                        var medicineJson = {
                            "name": "",
                            "price": "",
                            "quantity": "",
                            "expDate": ""
                        };
                        var medicineData = medicine[j];
                        var checkMedicineEmptyFields;
                        Object.keys(medicineJson).forEach(function (key) {
                            if (isEmpty(medicineData[key])) {
                                checkMedicineEmptyFields = `Please enter ${key}`;
                                return false;
                            }
                        });

                        if (!isEmpty(checkMedicineEmptyFields)) {
                            return checkMedicineEmptyFields;
                        }

                        patientRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                            fieldId: 'name',
                            line: j,
                            value: name
                        });

                        patientRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                            fieldId: 'custrecord_wipfli_medicine_price',
                            line: j,
                            value: price
                        });

                        patientRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                            fieldId: 'custrecord_wipfli_medicine_quantity',
                            line: j,
                            value: quantity
                        });

                        patientRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                            fieldId: 'custrecord_wipfli_medicine_total_price',
                            line: j,
                            value: price * quantity
                        });

                        patientRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                            fieldId: 'custrecord_wipfli_medicine_expire_date',
                            line: j,
                            value: expireDate
                        });
                    }
                    patientRecord.save({
                    });

                    return "Record successfully created";
                } catch (e) {
                    log.error("error in post", e.message);
                    return e.message;
                }
            }
        };

        const put = (requestBody) => {
            try {
                var id = requestBody.id;
                var firstName = requestBody.firstName;
                var lastName = requestBody.lastName;
                var email = requestBody.email;
                var phoneNumber = requestBody.phoneNumber;
                var dateOfBirth = requestBody.dateOfBirth;
                if (dateOfBirth) {
                    var dateOfBirthFormat = new Date(dateOfBirth);
                }
                var address = requestBody.address;
                var doctorName = requestBody.doctorName;

                ////Patient search to check for the enterted ID is there in patient record or not
                var patientRecSearch = search.create({
                    type: "customrecord_wipfli_patient_record",
                    filters:
                        [
                            ["internalid", "is", id]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_wipfli_patient_full_name", label: "Patient Full name" }),
                        ]
                });
                var searchResultCount = patientRecSearch.runPaged().count;
                if (searchResultCount > 0) {
                    var fullName = firstName + ' ' + lastName;
                    if (!isEmpty(firstName) && !isEmpty(lastName)) {
                        //patient record search to check for identical names
                        var patientSearch = search.create({
                            type: "customrecord_wipfli_patient_record",
                            filters:
                                [
                                    ["custrecord_wipfli_patient_full_name", "is", fullName]
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
                        searchResultCount = patientSearch.runPaged().count;
                        if (searchResultCount > 0) {
                            return "The patient name is already exist";
                        }
                    }

                    var patientRecord = record.load({
                        type: 'customrecord_wipfli_patient_record',
                        id: id,
                    });

                    if (firstName) {
                        patientRecord.setValue({
                            fieldId: 'custrecord_wipfli_patient_first_name',
                            value: firstName
                        });
                    }

                    if (lastName) {
                        patientRecord.setValue({
                            fieldId: 'custrecord_wipfli_patient_second_name',
                            value: lastName,
                            ignoreFieldChange: false
                        });
                    }

                    patientRecord.setValue({
                        fieldId: 'custrecord_wipfli_patient_full_name',
                        value: firstName + ' ' + lastName
                    });

                    var today = new Date();
                    var date = new Date(dateOfBirth);
                    var patientAge = today.getFullYear() - date.getFullYear();
                    if (dateOfBirthFormat) {
                        patientRecord.setValue({
                            fieldId: 'custrecord_wipfli_patient_age',
                            value: patientAge
                        });
                    }
                    if (dateOfBirthFormat) {
                        patientRecord.setValue({
                            fieldId: 'custrecord_wipfli_patient_dateob',
                            value: dateOfBirthFormat
                        });
                    }

                    if (phoneNumber) {
                        patientRecord.setValue({
                            fieldId: 'custrecord_wipfli_patient_pno',
                            value: phoneNumber
                        });
                    }

                    if (email) {
                        patientRecord.setValue({
                            fieldId: 'custrecord_wipfli_patient_mail',
                            value: email
                        });
                    }

                    if (address) {
                        patientRecord.setValue({
                            fieldId: 'custrecordcustrecord_wipfli_patient_addr',
                            value: address
                        });
                    }

                    if (doctorName) {
                        patientRecord.setText({
                            fieldId: 'custrecord_wipfli_patient_doctor_name',
                            text: doctorName,
                            ignoreFieldChange: true
                        });
                    }

                    var medicine = requestBody.medicine;
                    if (!isEmpty(medicine)) {
                        var linecount = patientRecord.getLineCount({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient'
                        });

                        for (var i = 0; i < medicine.length; i++) {
                            var quantity = medicine[i].quantity;
                            var price = medicine[i].price;
                            var expDate = medicine[i].expDate;
                            for (var j = 0; j < linecount; j++) {
                                var expireDate = new Date(expDate);
                                var medName = patientRecord.getSublistValue({
                                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                    fieldId: 'name',
                                    line: j
                                });

                                //update sublist by taking medicine name
                                if (medicine[i].name == medName) {
                                    if (quantity) {
                                        patientRecord.setSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_quantity',
                                            line: j,
                                            value: quantity
                                        });
                                    }

                                    if (price) {
                                        patientRecord.setSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_price',
                                            line: j,
                                            value: price
                                        });
                                    }

                                    if (!isEmpty(quantity)) {
                                        var medPrice = patientRecord.getSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_price',
                                            line: j
                                        });

                                        var total = medPrice * quantity;
                                        patientRecord.setSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_total_price',
                                            line: j,
                                            value: total
                                        });
                                    }

                                    if (!isEmpty(price)) {
                                        var medQuantity = patientRecord.getSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_price',
                                            line: j
                                        });

                                        total = price * medQuantity;
                                        patientRecord.setSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_total_price',
                                            line: j,
                                            value: total
                                        });
                                    }

                                    if (!isEmpty(price) && !isEmpty(quantity)) {
                                        medQuantity = patientRecord.getSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_price',
                                            line: j
                                        });

                                        total = price * quantity;
                                        patientRecord.setSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_total_price',
                                            line: j,
                                            value: total
                                        });
                                    }

                                    if (expDate) {
                                        patientRecord.setSublistValue({
                                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                            fieldId: 'custrecord_wipfli_medicine_expire_date',
                                            line: j,
                                            value: expireDate
                                        });
                                    }
                                }
                            }
                        }
                    }
                    patientRecord.save();
                    return "The record updated successfully";
                } else {
                    return "The id is Not found in patient record";
                }
            } catch (e) {
                log.debug({
                    title: "Error in put function",
                    details: e.message
                });
                return e.message;
            }
            function isEmpty(value) { return value === '' || value === null || value === undefined; }
        };

        const doDelete = (requestParams) => {
            try {
                var recId = requestParams.id;
                var type = requestParams.type;
                var rec = type.toLowerCase();
                if (rec == 'patient') {
                    ////Patient search to check for the enterted ID is there in patient record or not
                    var patientRecSearch = search.create({
                        type: "customrecord_wipfli_patient_record",
                        filters:
                            [
                                ["internalid", "is", recId]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "custrecord_wipfli_patient_full_name", label: "Patient Full name" }),
                            ]
                    });
                    var searchResultCount = patientRecSearch.runPaged().count;
                    if (searchResultCount > 0) {
                        var patientRec = record.load({
                            type: 'customrecord_wipfli_patient_record',
                            id: recId,
                            isDynamic: true
                        });

                        var sublistCount = patientRec.getLineCount({
                            sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient'
                        });

                        if (sublistCount > 0) {
                            for (var i = 0; i < sublistCount; i++) {
                                var subListId = patientRec.getSublistValue({
                                    sublistId: 'recmachcustrecord_wipfli_medicine_ref_patient',
                                    fieldId: 'id',
                                    line: i
                                });

                                record.delete({
                                    type: 'customrecord_wipfli_medicine_record',
                                    id: subListId
                                });
                            }
                            record.delete({
                                type: 'customrecord_wipfli_patient_record',
                                id: recId
                            });

                            return "patient record deleted successfully";
                        } else {
                            record.delete({
                                type: 'customrecord_wipfli_patient_record',
                                id: recId
                            });
                            return "patient record deleted successfully";
                        }
                    } else {
                        return "The patient Record is not Found with this id";
                    }
                }

                if (rec == 'medicine') {
                    var medicineRecSearch = search.create({
                        type: "customrecord_wipfli_medicine_record",
                        filters:
                            [
                                ["internalid", "is", recId]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "scriptid",
                                    sort: search.Sort.ASC,
                                    label: "Script ID"
                                }),
                                search.createColumn({ name: "name", label: "medicine name" }),
                            ]
                    });
                    searchResultCount = medicineRecSearch.runPaged().count;
                    if (searchResultCount > 0) {
                        record.load({
                            type: 'customrecord_wipfli_medicine_record',
                            id: recId,
                            isDynamic: true,
                        });

                        record.delete({
                            type: 'customrecord_wipfli_medicine_record',
                            id: recId
                        });
                        return "Record deleted successfully from medicine record";
                    } else {
                        return "The medical record is not found with this id";
                    }
                }
            } catch (e) {
                log.error({
                    title: "Error in Delete function",
                    details: e.message
                });
                return e.message;
            }
        };

        return { get, post, put, delete: doDelete };
    });
