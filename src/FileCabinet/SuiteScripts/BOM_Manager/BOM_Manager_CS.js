/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Nov 2015     mdeasis
 *
 */
{
	var CONFIG={
		title: 'BOM Manager',
		bom_sublist_items: 'custlst_bom_items',
		//Params
		param_bom_subsidiary: 'custfld_bom_subsidiary',
		param_bom_planner: 'custfld_bom_planner',
		param_bom_serialized: 'custfld_bom_serial',
		param_bom_lotnumbered: 'custfld_bom_lotnumbered',
		param_bom_route: 'custfld_bom_route',
		param_bom_mode: 'custfld_bom_mode',
		//Items param
		param_item_id: 'custfld_item_id',
		param_item_id_old: 'custfld_item_id_old',
		param_item_type: 'custfld_item_type',
		param_item_name: 'custfld_item_name',
		param_item_desc: 'custfld_item_desc',
		param_item_components: 'custfld_item_components',
		param_item_source: 'custfld_item_source',
		//Scripts
		bom_client: 'customscript_bom_manager_ue',
		//Suitelet
		bom_suitelet: 'customscript_bom_manager_sl',
		bom_deploy: 'customdeploy_bom_manager_sl',
	};
}

function bom_manager_saveRecord() {
	var mode=nlapiGetFieldValue(CONFIG.param_bom_mode);
	if (mode=='101') {
		var count=nlapiGetLineItemCount(CONFIG.bom_sublist_items);
		for (var i=1;i<=count;i++) {
			if (nlapiGetLineItemValue(CONFIG.bom_sublist_items, 'bom_select', i)=='T') {
				return true;
			}
		}
		alert('Please select one Assembly/ BOM Item to process.');
		return false;
	}
	else if (mode=='102') {
		//<<--
		//Assembly Item Name/ Code Checker
		var item_new_name=nlapiGetFieldValue(CONFIG.param_item_id);
		var item_old_name=nlapiGetFieldValue(CONFIG.param_item_id_old);
		if (item_new_name==item_old_name || isItemExists(item_new_name)) {
			alert('There is already an assembly item with that name.');
			return false;
		}
		//Assembly Item Name/ Code Checker
		//-->>
		//<<--
		//Components Validator
		var ctr=0, size=nlapiGetLineItemCount(CONFIG.param_item_components), html_code='The following item name(s) to be created from the components already exist(s):';
		for (var i=1;i<=size;i++) {
			if (nlapiGetLineItemValue(CONFIG.param_item_components, 'com_select', i)=='T') {
				var mem_new_type=nlapiGetLineItemValue(CONFIG.param_item_components, 'com_type', i);
				var mem_old_type=nlapiGetLineItemValue(CONFIG.param_item_components, 'com_type_old', i);
				var mem_new_unit=nlapiGetLineItemValue(CONFIG.param_item_components, 'com_unit_type', i);
				var mem_old_unit=nlapiGetLineItemValue(CONFIG.param_item_components, 'com_unit_type_old', i);
				var mem_new_unit_txt=nlapiGetLineItemText(CONFIG.param_item_components, 'com_unit_type', i);
				var mem_name=nlapiGetLineItemValue(CONFIG.param_item_components, 'com_id', i);
				var mem_is_assembly=nlapiGetLineItemValue(CONFIG.param_item_components, 'com_is_assembly', i);
				
				if (mem_is_assembly=='T') {
					switch (mem_new_type) {
						case 'inventoryitem':
							mem_new_type='assemblyitem';
							break;
						case 'serializedinventoryitem':
							mem_new_type='serializedassemblyitem';
							break;
						case 'lotnumberedinventoryitem':
							mem_new_type='lotnumberedassemblyitem';
							break;
					}
				}
				if (mem_new_type!=mem_old_type) {
					if (isItemExists(mem_name)) {
						html_code+='\n'+mem_name+' ('+mem_new_type+')';
						ctr++;
					}
				}
				else if (mem_new_unit!=mem_old_unit) {
					if (isItemExists(mem_name)) {
						html_code+='\n'+mem_name+' ('+mem_new_unit_txt+')';
						ctr++;
					}
				}
			}
		}
		if (ctr>0) {
			alert(html_code);
			return false;
		}
		//Components Validator
		//-->>
	}
	return true;
}

function isItemExists(item_id) {
	var rs=nlapiSearchRecord('item', null, [new nlobjSearchFilter('itemid', null, 'is', item_id)], []);
	return (rs!=null && rs.length>0);
}

function bom_manager_fieldChanged(type, name, line){
	var mode=nlapiGetFieldValue(CONFIG.param_bom_mode);
	if (mode=='102' && name==CONFIG.param_item_type) {
		if (nlapiGetFieldText(name)=='') {
			var count=nlapiGetLineItemCount(CONFIG.param_item_components);
			for (var i=1;i<=count;i++) {
				nlapiSetLineItemValue(CONFIG.param_item_components, 'com_type', i, 'inventoryitem');
			}
			nlapiDisableLineItemField(CONFIG.param_item_components, 'com_type', true);
		}
		else {
			nlapiDisableLineItemField(CONFIG.param_item_components, 'com_type', false);
		}
	}
	else if (mode=='101' && name=='bom_select') {
		var count=nlapiGetLineItemCount(CONFIG.bom_sublist_items);
		for (var i=1;i<=count;i++) {
			if (line!=i) {
				nlapiSetLineItemValue(CONFIG.bom_sublist_items, 'bom_select', i, 'F');
			}
		}
	}
}

function bom_manager_refresh() {
	var subsidiary=nlapiGetFieldValues(CONFIG.param_bom_subsidiary);
	var planner=nlapiGetFieldValues(CONFIG.param_bom_planner);
	var route=nlapiGetFieldValues(CONFIG.param_bom_route);
	var is_serial=nlapiGetFieldValue(CONFIG.param_bom_serialized);
	var is_lotnumber=nlapiGetFieldValue(CONFIG.param_bom_lotnumbered);
	//URL
	var suitelet_url=nlapiResolveURL('SUITELET', CONFIG.bom_suitelet, CONFIG.bom_deploy);
	if (!isValSet(subsidiary) && subsidiary.length>0) {
		suitelet_url+='&'+CONFIG.param_bom_subsidiary+'='+subsidiary.join(',');
	}
	if (!isValSet(planner) && planner.length>0) {
		suitelet_url+='&'+CONFIG.param_bom_planner+'='+planner.join(',');
	}
	if (!isValSet(route) && route.length>0) {
		suitelet_url+='&'+CONFIG.param_bom_route+'='+route.join(',');
	}
	if (is_serial=='T') {
		suitelet_url+='&'+CONFIG.param_bom_serialized+'=T';
	}
	if (is_lotnumber=='T') {
		suitelet_url+='&'+CONFIG.param_bom_lotnumbered+'=T';
	}
	window.location.href=suitelet_url;
}

function isValSet(data) {
	return (data==null || data=='');
}
