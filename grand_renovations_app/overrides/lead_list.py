from frappe import _

def get_indicator(doc):
    """
    Set color for Lead Stage in List View
    """

    stage = doc.custom_stage

    if stage == "Closed Lost":
        return _("Closed Lost"), "red", "custom_stage,=,Closed Lost"

    if stage == "Closed Won":
        return _("Closed Won"), "green", "custom_stage,=,Closed Won"

    if stage == "Order Confirmed":
        return _("Order Confirmed"), "blue", "custom_stage,=,Order Confirmed"

    if stage == "Quoted":
        return _("Quoted"), "orange", "custom_stage,=,Quoted"

    if stage == "Survey Booked":
        return _("Survey Booked"), "purple", "custom_stage,=,Survey Booked"

    if stage == "Contacted":
        return _("Contacted"), "gray", "custom_stage,=,Contacted"

    return _(stage), "gray", f"custom_stage,=,{stage}"
