/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record','N/search'],
   /**
* @param{record} record
*/
   (record,search) => {
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
            var id = requestParams.id;
            var customrecord_wipfli_passport_recordSearchObj = search.create({
               type: "customrecord_wipfli_passport_record",
               filters:
                  [
                     ["custrecord_wipfli_passport_holder_name","anyof",id]
                  ],
               columns:
                  [
                     search.createColumn({
                        name: "id",
                        sort: search.Sort.ASC,
                        label: "ID"
                     }),
                     search.createColumn({ name: "custrecord_wipfli_passport_holder_name", label: "Name" }),
                     search.createColumn({
                        name: "title",
                        join: "CUSTRECORD_WIPFLI_PASSPORT_HOLDER_NAME",
                        label: "Job Title"
                     }),
                     search.createColumn({
                        name: "location",
                        join: "CUSTRECORD_WIPFLI_PASSPORT_HOLDER_NAME",
                        label: "Location"
                     })
                  ]
            });
            var passportdetails = customrecord_wipfli_passport_recordSearchObj.run();
            var searchObject = passportdetails.getRange(0, 1000);
            var passportData = [];
            for (i = 0; i < searchObject.length; i++) {
               var passportName = searchObject[i].getValue({
                  name: "custrecord_wipfli_passport_holder_name"
               });
               var title = searchObject[i].getValue({
                  name: "title",
                  join: "CUSTRECORD_WIPFLI_PASSPORT_HOLDER_NAME"
               });
               var location = searchObject[i].getValue({
                  name: "location",
                  join: "CUSTRECORD_WIPFLI_PASSPORT_HOLDER_NAME"
               });
               log.debug("title",title);
               log.debug("passportname",passportName);
               passportData.push({
                  'name': passportName,
                  'title': title,
                  'lacation': location
               });
               log.debug("passportdata",passportData);
               return passportData;
            }
            
         }



         catch (e) {
            log.debug({
               title: "Error in get function",
               details: e.message
            })
            return e.message;
         }
      }

      const doDelete = (requestParams) => {
         try{
            var Record = requestParams;
            var id = Record.id;
           var passportDelete = record.delete({
            type: 'customrecord_wipfli_passport_record',
            id: id
           });
           
   
           return "Record deleted successfully"
         }
         catch(e){
            log.debug({
               title: "Error in delete function",
               details: e.message
            })
             return e.message
         }
        

      }

      return { get,delete: doDelete}

   });
