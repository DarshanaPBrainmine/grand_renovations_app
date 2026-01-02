frappe.listview_settings["Survey"] = {
    get_indicator(doc) {
        const stage = doc.custom_stage || "—";
        const color = window.GR_STAGE_COLORS?.[stage] || "gray";
        return [stage, color];
    }
};
