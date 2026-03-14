



// console.log("Vendor Pricing JS Loaded");

// frappe.ui.form.on("Vendor Pricing", {

//     refresh(frm) {

//         // Load survey data only once when new document
//         if (frm.is_new() && frm.doc.survey && !frm.__survey_loaded) {
//             frm.__survey_loaded = true;
//             fetch_survey_data(frm);
//         }

//         render_pricing_ui(frm);
//         update_grand_total(frm);
//     }

// });


// // ---------------------------------------------------
// // FETCH DATA FROM SURVEY
// // ---------------------------------------------------
// function fetch_survey_data(frm) {

//     frappe.db.get_doc("Survey", frm.doc.survey)
//         .then(survey => {

//             if (!survey.project_type) return;

//             let entries = survey.project_type.split(", ");

//             frm.clear_table("pricing_items");

//             entries.forEach(entry => {

//                 let parts = entry.split(":");
//                 let product = parts[0]?.trim();
//                 let qty = parseInt(parts[1]) || 1;

//                 let row = frm.add_child("pricing_items");

//                 frappe.model.set_value(row.doctype, row.name, "product_type", product);
//                 frappe.model.set_value(row.doctype, row.name, "quantity", qty);
//             });

//             frm.refresh_field("pricing_items");
//             frm.dirty();

//             render_pricing_ui(frm);
//             update_grand_total(frm);
//         });
// }


// // ---------------------------------------------------
// // RENDER CUSTOM CARD UI (2 PER ROW)
// // ---------------------------------------------------
// function render_pricing_ui(frm) {

//     if (!frm.fields_dict.pricing_ui) return;

//     let wrapper = frm.fields_dict.pricing_ui.$wrapper;
//     wrapper.empty();

//     if (!frm.doc.pricing_items || frm.doc.pricing_items.length === 0) {
//         wrapper.html("<p>No products found.</p>");
//         return;
//     }

//     // 🔥 GRID CONTAINER
//     let grid = $(`
//         <div style="
//             display:grid;
//             grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
//             gap:20px;
//             width:100%;
//         "></div>
//     `);

//     wrapper.append(grid);

//     frm.doc.pricing_items.forEach(row => {

//         let card = $(`
//             <div style="
//                 padding:14px;
//                 border:1px solid #e5e5e5;
//                 border-radius:8px;
//                 background:#fafafa;
//             ">

//                 <h4 style="margin-bottom:6px;">
//                     ${row.product_type || ""}
//                 </h4>

//                 <p style="margin-bottom:10px;">
//                     Quantity: ${row.quantity || 0}
//                 </p>

//                 <div style="display:flex; gap:8px; align-items:center;">

//                     <select class="vendor"
//                         data-row="${row.name}"
//                         style="flex:1; padding:6px;">
//                         <option value="">Select Vendor</option>
//                     </select>

//                     <input type="number"
//                         class="unit_cost"
//                         data-row="${row.name}"
//                         value="${row.unit_cost || ""}"
//                         placeholder="Unit Cost"
//                         style="width:120px; padding:6px;" />
//                 </div>

//                 <div style="margin-top:8px;">
//                     <strong>Total:
//                         <span id="total_${row.name}">
//                             ${row.total_cost || 0}
//                         </span>
//                     </strong>
//                 </div>

//             </div>
//         `);

//         grid.append(card);
//     });


//     // ---------------------------------------------------
//     // LOAD SUPPLIERS
//     // ---------------------------------------------------
//     frappe.db.get_list("Supplier", {
//         fields: ["name"],
//         limit: 1000
//     }).then(suppliers => {

//         wrapper.find(".vendor").each(function () {

//             let select = $(this);
//             let rowname = select.data("row");

//             suppliers.forEach(s => {
//                 select.append(`<option value="${s.name}">${s.name}</option>`);
//             });

//             let row = frm.doc.pricing_items.find(r => r.name === rowname);
//             if (row && row.vendor) {
//                 select.val(row.vendor);
//             }
//         });

//     });


//     // ---------------------------------------------------
//     // SAVE + CALCULATE
//     // ---------------------------------------------------
//     wrapper.off("change").on("change", ".vendor, .unit_cost", function () {

//         let rowname = $(this).data("row");
//         let row = frm.doc.pricing_items.find(r => r.name === rowname);
//         if (!row) return;

//         let vendor = wrapper.find(`.vendor[data-row="${rowname}"]`).val();
//         let cost = parseFloat(
//             wrapper.find(`.unit_cost[data-row="${rowname}"]`).val()
//         ) || 0;

//         frappe.model.set_value(row.doctype, rowname, "vendor", vendor);
//         frappe.model.set_value(row.doctype, rowname, "unit_cost", cost);

//         let total = (row.quantity || 0) * cost;

//         frappe.model.set_value(row.doctype, rowname, "total_cost", total);

//         $(`#total_${rowname}`).text(total);

//         update_grand_total(frm);

//         frm.refresh_field("pricing_items");
//         frm.dirty();
//     });
// }


// // ---------------------------------------------------
// // UPDATE GRAND TOTAL
// // ---------------------------------------------------
// function update_grand_total(frm) {

//     let grand_total = 0;

//     if (frm.doc.pricing_items) {
//         frm.doc.pricing_items.forEach(row => {
//             grand_total += (row.total_cost || 0);
//         });
//     }

//     frm.set_value("total_vendor_cost", grand_total);
// }




console.log("Vendor Pricing JS Loaded");

frappe.ui.form.on("Vendor Pricing", {

    refresh(frm) {

        // Load survey data once
        if (frm.is_new() && frm.doc.survey && !frm.__survey_loaded) {
            frm.__survey_loaded = true;
            fetch_survey_data(frm);
        }

        render_pricing_ui(frm);
        update_grand_total(frm);

        // ---------------------------------------------------
        // ACTION BUTTONS
        // ---------------------------------------------------

        if (!frm.is_new()) {

            // CREATE PURCHASE ORDER
            frm.add_custom_button("Create Purchase Order", function () {

                frappe.call({
                    method: "grand_renovations_app.api.vendor_pricing.create_purchase_order",
                    args: {
                        vendor_pricing: frm.doc.name
                    },
                    callback: function (r) {

                        if (!r.message) return;

                        let pos = r.message;

                        if (!Array.isArray(pos)) {
                            pos = [pos];
                        }

                        frappe.msgprint({
                            title: "Purchase Orders Created",
                            message: pos.join("<br>"),
                            indicator: "green"
                        });

                    }
                });

            });


            // SEND SUBCONTRACT AGREEMENT
            frm.add_custom_button("Send Subcontract Agreement", function () {

                frappe.call({
                    method: "grand_renovations_app.api.vendor_pricing.create_subcontract_agreement",
                    args: {
                        vendor_pricing: frm.doc.name
                    },
                    callback: function (r) {

                        if (r.message) {

                            frappe.show_alert("Subcontract Agreement Created");

                            frappe.set_route(
                                "Form",
                                "Subcontract Agreement",
                                r.message
                            );

                        }

                    }
                });

            });

        }

    }

});



/* -------------------------------------------------- */
/* FETCH DATA FROM SURVEY */
/* -------------------------------------------------- */

function fetch_survey_data(frm) {

    frappe.db.get_doc("Survey", frm.doc.survey)
        .then(survey => {

            if (!survey.project_type) return;

            let entries = survey.project_type.split(", ");

            frm.clear_table("pricing_items");

            entries.forEach(entry => {

                let parts = entry.split(":");
                let product = parts[0]?.trim();
                let qty = parseInt(parts[1]) || 1;

                let row = frm.add_child("pricing_items");

                frappe.model.set_value(row.doctype, row.name, "product_type", product);
                frappe.model.set_value(row.doctype, row.name, "quantity", qty);

            });

            frm.refresh_field("pricing_items");
            frm.dirty();

            render_pricing_ui(frm);
            update_grand_total(frm);

        });

}



/* -------------------------------------------------- */
/* RENDER PRODUCT CARDS */
/* -------------------------------------------------- */

function render_pricing_ui(frm) {

    if (!frm.fields_dict.pricing_ui) return;

    let wrapper = frm.fields_dict.pricing_ui.$wrapper;

    wrapper.empty();

    if (!frm.doc.pricing_items || frm.doc.pricing_items.length === 0) {
        wrapper.html("<p>No products found.</p>");
        return;
    }

    let grid = $(`
        <div style="
            display:grid;
            grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
            gap:20px;
        "></div>
    `);

    wrapper.append(grid);



    frm.doc.pricing_items.forEach(row => {

        let card = $(`

        <div style="
            padding:14px;
            border:1px solid #e5e5e5;
            border-radius:8px;
            background:#fafafa;
        ">

            <h4>${row.product_type || ""}</h4>

            <p>Quantity: ${row.quantity || 0}</p>

            <div style="display:flex; gap:8px;">

                <select class="vendor"
                    data-row="${row.name}"
                    style="flex:1;padding:6px;">
                    <option value="">Select Vendor</option>
                </select>

                <input type="number"
                    class="unit_cost"
                    data-row="${row.name}"
                    value="${row.unit_cost || ""}"
                    placeholder="Unit Cost"
                    style="width:120px;padding:6px;" />

            </div>

            <div style="margin-top:10px;">
                <strong>Total:
                    <span id="total_${row.name}">
                        ${row.total_cost || 0}
                    </span>
                </strong>
            </div>

        </div>

        `);

        grid.append(card);

    });



    /* -------------------------------------------------- */
    /* LOAD SUPPLIERS INTO DROPDOWN */
    /* -------------------------------------------------- */

    frappe.db.get_list("Supplier", {
        fields: ["name"],
        limit: 1000
    }).then(suppliers => {

        wrapper.find(".vendor").each(function () {

            let select = $(this);
            let rowname = select.data("row");

            suppliers.forEach(s => {
                select.append(`<option value="${s.name}">${s.name}</option>`);
            });

            let row = frm.doc.pricing_items.find(r => r.name === rowname);

            if (row && row.vendor) {
                select.val(row.vendor);
            }

        });

    });



    /* -------------------------------------------------- */
    /* SAVE + CALCULATE */
    /* -------------------------------------------------- */

    wrapper.off("change", ".vendor, .unit_cost").on("change", ".vendor, .unit_cost", function () {

        let rowname = $(this).data("row");

        let row = frm.doc.pricing_items.find(r => r.name === rowname);

        if (!row) return;

        let vendor = wrapper.find(`.vendor[data-row="${rowname}"]`).val();

        let cost = parseFloat(
            wrapper.find(`.unit_cost[data-row="${rowname}"]`).val()
        ) || 0;

        frappe.model.set_value(row.doctype, rowname, "vendor", vendor);
        frappe.model.set_value(row.doctype, rowname, "unit_cost", cost);

        let total = (row.quantity || 0) * cost;

        frappe.model.set_value(row.doctype, rowname, "total_cost", total);

        $(`#total_${rowname}`).text(total);

        update_grand_total(frm);

        frm.refresh_field("pricing_items");
        frm.dirty();

    });

}



/* -------------------------------------------------- */
/* UPDATE GRAND TOTAL */
/* -------------------------------------------------- */

function update_grand_total(frm) {

    let grand_total = 0;

    if (frm.doc.pricing_items) {

        frm.doc.pricing_items.forEach(row => {

            grand_total += (row.total_cost || 0);

        });

    }

    frm.set_value("total_vendor_cost", grand_total);

}