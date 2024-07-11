var partida =
{
    formId:"", form:null, elems:null, GET:{},
    url_exit:"/!/pregop/editor/",
    url_partida:"/!/pregop/gop_partida/",
    url_change_status:"/!/pregop/editor/@partida/change-pda-status/?status=@status&presupuesto=@presupuesto",
    url_logs:"/!/pregop/gop_partida_log/",
    url_files:"",
    cfg_status:"",
    error_timeout:7,

    init()
    {
        this.form = document.getElementById(this.formId);
        this.elems = this.form?.elements;
        const txt_adjuntos = document.getElementById("txt_adjuntos");
        const txt_log = document.getElementById("txt_log");
        const btn_send_log = document.getElementById("btn_send_log");
        const btn_submit = document.getElementById("btn_submit");
        const btn_cancel = document.getElementById("btn_cancel");

        if (btn_cancel) btn_cancel.addEventListener("click", (e) => this.toggleEdit(false));
        if (btn_submit) btn_submit.addEventListener("click", (e) => {
            e.preventDefault();
            if (e.target.type === "submit") this.submit();
            else this.toggleEdit(true);
        });

        txt_log.addEventListener("keydown", (e) => { if (e.key === "Enter") this.sendLog(); });
        btn_send_log.addEventListener("click", (e) => this.sendLog());
        
        this.updateAnualField();
        this.showButtonStatus();
        this.toggleEditFieldsByStatus();
    },

    updateAnualField()
    {
        const txt_anual = document.getElementById("txt_anual");
        const txt_reserva = document.getElementById("txt_reserva");
        
        if (!txt_reserva.hasChangeListener) {
            txt_reserva.addEventListener("change", () => this.updateAnualField());
            txt_reserva.hasChangeListener = true;
        }
        
        let ImporteAnual = Number(txt_reserva.value);
        for (let mes = 1; mes <= 12; mes++) {
            const txt_periodo = document.getElementById(`txt_p${mes.toString().padStart(2,"0")}`);
            if (!txt_periodo.hasChangeListener) {
                txt_periodo.addEventListener("change", () => this.updateAnualField());
                txt_periodo.hasChangeListener = true;
            }
            ImporteAnual = Math.add(ImporteAnual,Number(txt_periodo.value));
        }

        txt_anual.value = Math.RoundTo(ImporteAnual,4);
    },

    updateFormValues()
    {
        if (!this.form) return;
        Array.from(this.elems).forEach(el => {
            if ("defaultValue" in el) el.defaultValue = el.value;
        });
    },

    toggleEdit(editMode)
    {
        this.disableControls(["status_control"],editMode);
        this.disableControls(["txt_id","txt_partida","txt_autorizado","txt_reserva","txt_p01","txt_p02","txt_p03","txt_p04","txt_p05","txt_p06","txt_p07","txt_p08","txt_p09","txt_p10","txt_p11","txt_p12","txt_notas"],!editMode);
        this.elems["btn_cancel"].hidden = !editMode;
        this.elems["btn_submit"].textContent = (editMode) ? "Guardar" : "Modificar";
        this.elems["btn_submit"].type = (editMode) ? "submit" : "button";
    },

    submit()
    {
        if (!this.form) {
            console.warn("Foumulario no esta definido.");
            return
        }
        if (!this.form.reportValidity()) return;
        this.elems["btn_submit"].disabled = true;
        this.elems["btn_cancel"].disabled = true;
        this.disableControls(["status_control"]);

        let endpoint = this.url_partida+this.GET["_entity_id"]+"/";
        let fd = new FormData(this.form);

        const onSuccess = (data) => {
            if (!(data?.success??true) || (data?.message??"")!=="") {
                this.show_alert("#form_alerts",(data?.message ?? JSON.stringify(data)),this.error_timeout);
                this.elems["btn_submit"].disabled = false;
                this.elems["btn_cancel"].disabled = false;
                return
            }

            this.elems["sys_recver"].value = data.sys_recver;
            this.elems["btn_submit"].disabled = false;
            this.elems["btn_cancel"].disabled = false;
            this.updateFormValues();
            this.toggleEdit(false);
        }

        const onFailure = (error) => {
            this.show_alert("#form_alerts",(error.message ?? JSON.stringify(error)),this.error_timeout);
            this.elems["btn_submit"].disabled = false;
            this.elems["btn_cancel"].disabled = false;
        }

        InduxsoftCrudlModel.InvokeService(endpoint,fd,onSuccess,onFailure,"PUT",false,true,"",true);
    },

    changeStatus(button)
    {
        let params = {
            status: Number(button.getAttribute("status")),
            presupuesto: Number(this.elems["ref_presupuesto"].value)
        }
        let endpoint = (this.url_change_status).replace("@partida",this.GET["_entity_id"]);
        endpoint = InduxsoftCrudlModel.UrlReplace(endpoint,params);

        this.elems["status_control"].disabled = true;

        const onSuccess = (data) => {
            if (!(data?.success??true) || (data?.message??"")!=="") {
                this.show_alert("#form_alerts",(data?.message ?? JSON.stringify(data)),this.error_timeout);
                this.elems["status_control"].disabled = false;
                return
            }

            data["status"] = data.istatus;

            this.elems["sys_recver"].value = data.sys_recver;
            this.elems["status"].value = data.istatus;
            document.getElementById("spn_status").textContent = data.cstatus;
            
            this.updateFormValues();
            this.printLastLog();
            this.showButtonStatus(data);
            this.toggleEditFieldsByStatus(data);
            this.elems["status_control"].disabled = false;
        }

        const onFailure = (error) => {
            this.show_alert("#form_alerts",(error.message ?? JSON.stringify(error)),this.error_timeout);
            this.elems["status_control"].disabled = false;
        }

        InduxsoftCrudlModel.InvokeService(endpoint,null,onSuccess,onFailure,"PUT",false,true,"",false);
    },

    showButtonStatus(partida=null)
    {
        const container = document.querySelector("#status_control");
        const buttons = container.querySelectorAll(".btn-status");

        let status = Number(partida?.status??0);
        let padre = Number(partida?.padre??0);
        if (!partida) {
            const txt_status = document.getElementById("txt_status");
            const txt_padre = document.getElementById("txt_padre");
            status = Number(txt_status.value);
            padre = Number(txt_padre.value);
        }

        const AllowStatus = (a,b) => {
            let config = (this.cfg_status??"").trim().split(",");
            let allow = false;
            for (let i = 0; i < config.length; i++) {
                const kv = config[i].trim().split(":");
                // console.log(a,b,kv);
                if (kv[0]==a && kv[1]==b) {
                    allow = true;
                    break
                }
            }
            return allow;
        }

        let isRoot = (padre === 0);
        buttons.forEach(btn => {
            let show = (isRoot && AllowStatus(status,btn.getAttribute("status")));
            if (show) btn.addEventListener("click", (e) => this.changeStatus(e.target));
            else btn.removeEventListener("click", (e) => this.changeStatus(e.target));
            btn.hidden = !show;
        });
    },

    printLog(data)
    {
        // let div_log = document.getElementById("div_log");
        let tbody = document.querySelector("#tbl_logs tbody");
        
        let row = document.createElement("tr");    
        for (const key in data) {
            let cell = document.createElement("td");
            let text = document.createTextNode(data[key]);
            
            cell.appendChild(text)
            row.appendChild(cell) 
        }
        
        // Insertar fila en la última posición y mover el scroll al final.
        // tbody.appendChild(row);
        // div_log.scrollTop = tbody.scrollHeight;

        // Insertar fila en la primer posición.
        tbody.insertBefore(row,tbody.firstChild);
    },

    sendLog()
    {
        const txt_log = document.getElementById("txt_log");
        const btn_send_log = document.getElementById("btn_send_log");

        let text = (txt_log.value??"").trim();
        if (text === "") return;

        txt_log.disabled = true;
        btn_send_log.disabled = true;

        let fd = new FormData();
        fd.append("ref_partida",this.GET["_entity_id"]);
        fd.append("nota",text);

        let onSuccess = (data) => {
            if (!(data?.success??true) || (data?.message??"")!=="") {
                alert(data?.message ?? JSON.stringify(data));
                txt_log.disabled = false;
                btn_send_log.disabled = false;
                return
            }
            this.printLog(data);
            txt_log.value = "";
            txt_log.disabled = false;
            btn_send_log.disabled = false;
        }

        let onFailure = (error) => {
            console.error(error.message ?? JSON.stringify(error));
            txt_log.disabled = false;
            btn_send_log.disabled = false;
        }

        InduxsoftCrudlModel.InvokeService(this.url_logs,fd,onSuccess,onFailure,"POST",false,true,"",true);
    },

    printLastLog()
    {
        let url = (this.url_logs)+"?partida="+this.GET["_entity_id"]+"&limit=1";
        fetch(url).then(response => response.json())
        .then(data => {
            if (!(data?.success??true) || (data?.message??"")!=="") {
                console.log(data?.message ?? data);
                return
            }
            this.printLog(data[0]);
        })
        .catch(error => console.error(error))
    },

    toggleEditFieldsByStatus(partida=null)
    {
        const form_buttons = document.getElementById("div_form_buttons");
        let status = (partida) ? Number(partida?.status??0) : Number(this.elems["status"].value);

        switch (status) {
            case 1: //Prevista
                form_buttons.classList.toggle("d-none",false);
                this.blockControls(["txt_autorizado"]);
                this.blockControls(["txt_reserva","txt_p01","txt_p02","txt_p03","txt_p04","txt_p05","txt_p06","txt_p07","txt_p08","txt_p09","txt_p10","txt_p11","txt_p12"],false);
                break;
            case 2: //Revisión
            case 3: //Revisada
                form_buttons.classList.toggle("d-none",false);
                this.blockControls(["txt_autorizado"],false);
                this.blockControls(["txt_reserva","txt_p01","txt_p02","txt_p03","txt_p04","txt_p05","txt_p06","txt_p07","txt_p08","txt_p09","txt_p10","txt_p11","txt_p12"]);
                break;
            case 4: //Autorizada
            case 99: //Cancelada
                form_buttons.classList.toggle("d-none",true);
                this.toggleEdit(false);
                break
            default:
                break;
        }
    },

    disableControls(elementsId=[], value=true)
    {
        elementsId.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if ("disabled" in el) el.disabled = value;
                else el.setAttribute("disabled",value);
            }
        });
    },

    blockControls(elementsId=[], value=true)
    {
        elementsId.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.pointerEvents = (value) ? "none" : "";
                el.style.backgroundColor = (value) ? "#e9ecef" : "";
                el.style.opacity = (value) ? "1" : "";
                el.style.cursor = (value) ? "not-allowed" : "";
            }
        });
    },

    show_alert(selector,content,timeout)
    {
        const alert = document.querySelector(selector);
        if (!alert) return;
        if (!content) return;
        
        alert.classList.remove("d-none");
        alert.innerHTML = content;

        setTimeout(function() {
            alert.classList.add("d-none");
            alert.innerHTML = "";
        }, (timeout * 1000));
    },
}

document.addEventListener("DOMContentLoaded", () => {
    partida.init();
});