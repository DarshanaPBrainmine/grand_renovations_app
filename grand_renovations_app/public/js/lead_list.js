// // ========================================
// // FILE: lead.js
// // PATH: grand_renovations_app/public/js/lead.js
// // ========================================

// // ========================================
// // PART 1: HIDE STATUS FROM LIST VIEW
// // ========================================
// frappe.listview_settings['Lead'] = {
//     // Override the fields to display (this is the key!)
//     add_fields: ["lead_name", "company_name", "stage", "lead_owner"],
    
//     onload: function(listview) {
//         console.log("=== Lead List View Loaded ===");
        
//         // Force remove Status column
//         this.remove_status_column(listview);
        
//         // Monitor for any DOM changes and re-hide
//         if (listview.$page) {
//             const observer = new MutationObserver(() => {
//                 this.remove_status_column(listview);
//             });
            
//             observer.observe(listview.$page[0], {
//                 childList: true,
//                 subtree: true
//             });
//         }
//     },
    
//     refresh: function(listview) {
//         this.remove_status_column(listview);
//     },
    
//     remove_status_column: function(listview) {
//         // Method 1: Remove from columns array
//         if (listview && listview.columns) {
//             listview.columns = listview.columns.filter(col => 
//                 col.fieldname !== 'status'
//             );
//         }
        
//         // Method 2: Hide via CSS
//         setTimeout(() => {
//             // Hide Status column header
//             $('.list-row-head .list-row-col').each(function(index) {
//                 const headerText = $(this).find('.list-col-title').text().trim();
//                 if (headerText === 'Status') {
//                     console.log("Found Status column at index:", index);
//                     $(this).css({
//                         'display': 'none',
//                         'width': '0',
//                         'padding': '0',
//                         'margin': '0'
//                     });
                    
//                     // Hide all cells in this column
//                     $('.list-row').each(function() {
//                         $(this).find('.list-row-col').eq(index).css({
//                             'display': 'none',
//                             'width': '0',
//                             'padding': '0',
//                             'margin': '0'
//                         });
//                     });
//                 }
//             });
            
//             // Additional selectors
//             $('[data-field="status"]').css('display', 'none');
//             $('[data-fieldname="status"]').css('display', 'none');
//         }, 50);
//     }
// };

// // ========================================
// // PART 2: LEAD FORM CUSTOMIZATION
// // ========================================
// frappe.ui.form.on("Lead", {
//     refresh: function(frm) {
//         console.log("=== Lead Refresh ===");
//         console.log("Lead Name:", frm.doc.name);
//         console.log("Lead Status:", frm.doc.status);
        
//         // Render lead attachments
//         if (frm.fields_dict.custom_lead_files_html && !frm.is_new()) {
//             frm.trigger("render_lead_attachments");
//         }
        
//         // Add buttons for all non-new leads, regardless of status
//         if (!frm.is_new()) {
//             // Remove default buttons after a short delay
//             setTimeout(function() {
//                 frm.page.remove_inner_button('Opportunity', 'Create');
//                 frm.page.remove_inner_button('Prospect', 'Create');
//                 frm.page.remove_inner_button('Customer', 'Create');
//             }, 500);
            
//             // Always add Quotation button (regardless of conversion status)
//             if (!frm.custom_buttons[__('Quotation')]) {
//                 frm.add_custom_button(__('Quotation'), function() {
//                     console.log("Quotation button clicked for Lead:", frm.doc.name);
                    
//                     frappe.model.open_mapped_doc({
//                         method: "erpnext.crm.doctype.lead.lead.make_quotation",
//                         frm: frm
//                     });
//                 }, __('Create'));
//             }
            
//             // Always add Survey button (regardless of conversion status)
//             if (!frm.custom_buttons[__('Survey')]) {
//                 frm.add_custom_button(__('Survey'), function() {
//                     console.log("Survey button clicked for Lead:", frm.doc.name);
                    
//                     frappe.call({
//                         method: 'grand_renovations_app.overrides.lead.create_survey_from_lead',
//                         args: {
//                             source_name: frm.doc.name
//                         },
//                         callback: function(r) {
//                             console.log("Survey creation response:", r);
//                             if (r.message) {
//                                 frappe.model.sync(r.message);
//                                 frappe.set_route('Form', 'Survey', r.message.name);
//                                 frappe.show_alert({
//                                     message: __('Survey created successfully'),
//                                     indicator: 'green'
//                                 });
//                             }
//                         },
//                         error: function(r) {
//                             console.error("Survey creation error:", r);
//                             frappe.msgprint({
//                                 title: __('Error'),
//                                 indicator: 'red',
//                                 message: __('Failed to create survey. Please check if all required fields are filled.')
//                             });
//                         }
//                     });
//                 }, __('Create'));
//             }
            
//             // Add View Surveys button
//             if (!frm.custom_buttons[__('View Surveys')]) {
//                 frm.add_custom_button(__('View Surveys'), function() {
//                     frappe.set_route('List', 'Survey', {lead: frm.doc.name});
//                 }, __('View'));
//             }
//         }
//     },
    
//     // Re-trigger refresh when status changes to ensure buttons remain
//     status: function(frm) {
//         if (!frm.is_new()) {
//             setTimeout(function() {
//                 frm.trigger('refresh');
//             }, 100);
//         }
//     }
// });

// // ========================================
// // PART 3: GLOBAL CSS INJECTION
// // ========================================
// $(document).ready(function() {
//     if (!$('#hide-lead-status-global').length) {
//         $('head').append(`
//             <style id="hide-lead-status-global">
//                 /* Hide Status column in Lead List View */
//                 [data-page-route="List/Lead"] .list-row-col[data-field="status"],
//                 [data-page-route="List/Lead"] [data-fieldname="status"] {
//                     display: none !important;
//                     width: 0 !important;
//                     padding: 0 !important;
//                     margin: 0 !important;
//                     visibility: hidden !important;
//                 }
//             </style>
//         `);
//     }
// });



frappe.listview_settings['Lead'] = {
    onload: function(listview) {
        $('<style>')
            .prop('type', 'text/css')
            .html(`
                .indicator-pill[data-filter="stage,=,Closed Lost"] {
                    background-color: #dc3545 !important;
                }
            `)
            .appendTo('head');
    }
};