// // File: grand_renovations_app/public/js/sales_order_list.js

// frappe.listview_settings['Sales Order'] = {
//     onload: function(listview) {
//         // Add custom CSS to hide Status column
//         const style = document.createElement('style');
//         style.innerHTML = `
//             [data-doctype="Sales Order"] .list-row-col[data-field="status"],
//             [data-doctype="Sales Order"] .list-row-head[data-field="status"] {
//                 display: none !important;
//             }
//         `;
//         document.head.appendChild(style);
//     },
    
//     refresh: function(listview) {
//         // Hide status filter field if exists
//         setTimeout(() => {
//             if (listview.page.fields_dict.status) {
//                 listview.page.fields_dict.status.$wrapper.hide();
//             }
//         }, 100);
//     },
    
//     get_indicator: function(doc) {
//         const stage = doc.custom_stage;
//         const colors = {
//             "New": "blue",
//             "Contacted": "orange",
//             "Survey Booked": "purple",
//             "Quoted": "cyan",
//             "Closed Won": "green",
//             "Closed Lost": "red"
//         };
        
//         if (stage && colors[stage]) {
//             return [stage, colors[stage], "custom_stage,=," + stage];
//         }
        
//         // Fallback
//         return [stage || "No Stage", "gray", "custom_stage,=," + (stage || "")];
//     },
    
//     formatters: {
//         status: function(value, df, doc) {
//             // Return empty to hide status content
//             return '';
//         }
//     }
// };