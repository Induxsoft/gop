var editor = 
{
    dvspred: {},
    tableUnidades: null, 
    tablePartidas: null,
    tableSubUnids: null,
    unidades: [], 
    unidadSelected: null, 
    presupuestos: [],
    presupuesto: null, 
    partidas: [],
    partidasBackup: [],
    ejercicio_select: null,
    fieldsPresupuesto: [
        {id:'titulo', caption:'Título'},
        {id:'status_text', caption:'Estado'},
        {id:'divisa_text', caption:'Divisa'},
        {id:'monto_autorizado', caption:'Autorizado', format:true},
        {id:'monto_planeado', caption:'Planeado', format:true},
        {id:'monto_comprometido', caption:'Comprometido', format:true},
        {id:'monto_ejercido', caption:'Ejercido', format:true},
        {id:'notas', caption:'Notas'}
    ],
    fieldsResumen: [
        {id:'', caption:'Resumen'},
        // {id:'status_text', caption:'Estado'},
        {id:'divisa_text', caption:'Divisa'},
        {id:'monto_autorizado', caption:'Autorizado', format:true},
        {id:'monto_planeado', caption:'Planeado', format:true},
        {id:'monto_comprometido', caption:'Comprometido', format:true},
        {id:'monto_ejercido', caption:'Ejercido', format:true}
    ],

    init()
    {
        this.tableUnidades = document.querySelector('#treeUnidades');
        this.tablePartidas = document.querySelector('#treePartidas');
        this.tableSubUnids = document.querySelector('#tableSubUnids');

        this.setKeyboardShortcuts();
        this.setConfigTables();
        this.setEventTables();
        this.setAjustPanelUnidadEvent();

        this.ejercicio_select = document.querySelector('#ejercicio_select');
        const modal_presupuesto = document.querySelector('#modal_presupuesto');
        const modal_tr_partida = document.querySelector('#modal_tr_partida');
        const partidas_main_container = document.querySelector('#partidas_main_container');
        const partidas_resumen = document.querySelector('#partidas_resumen');
        const btn_add_unidad = document.querySelector('#btn_add_unidad');
        const btn_edit_unidad = document.querySelector('#btn_edit_unidad');
        const btn_tab_subunidades = document.querySelector('#btn_tab_subunidades');
        const btn_tab_presupuesto = document.querySelector('#btn_tab_presupuesto');
        const ik_tr_unidad = document.querySelector('#ik_tr_unidad');
        const ik_tr_presupuesto = document.querySelector('#ik_tr_presupuesto');

        if (this.ejercicio_select) this.ejercicio_select.addEventListener('change', () => {
            this.getUnidad(this.unidadSelected?.sys_pk??null, true);
            this.getPresupuesto(this.unidadSelected?.sys_pk??null) 
        });
        if (modal_presupuesto) modal_presupuesto.addEventListener('show.bs.modal', () => { this.load_presupuesto_modal(); });
        if (modal_tr_partida) modal_tr_partida.addEventListener('show.bs.modal', () => { ik_tr_unidad.setValue(this.unidadSelected); });
        if (modal_tr_partida) modal_tr_partida.addEventListener('hidden.bs.modal', () => { main.clearValues('modal_tr_partida'); });
        if (btn_add_unidad) btn_add_unidad.addEventListener('click', () => { this.load_unidad_modal(true) });
        if (btn_edit_unidad) btn_edit_unidad.addEventListener('click', () => { this.load_unidad_modal(false) });
        if (btn_tab_subunidades) btn_tab_subunidades.addEventListener('click', () => this.selectTabTable(btn_tab_subunidades));
        if (btn_tab_presupuesto) btn_tab_presupuesto.addEventListener('click', () => this.selectTabTable(btn_tab_presupuesto));
        if (ik_tr_unidad) ik_tr_unidad.change_event = (data) => { ik_tr_presupuesto.clear(); };
        if (ik_tr_presupuesto) ik_tr_presupuesto.onBeforeSearch = (s) => this.onBeforeSearchPresupuesto(s);
        
        window.addEventListener('resize', (e) => this.onResize(e));
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirtyPresupuesto()) {
                let message = "Es posible que no se guarden los cambios realizados en las partidas.";
                e.preventDefault();
            }
        });

        this.observeAttributes(partidas_main_container, (mutation) => {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                const style = getComputedStyle(partidas_main_container);
                if (style.display != 'none') {
                    partidas_resumen.classList.remove('d-none');
                    partidas_resumen.classList.add('d-flex');
                    
                    setTimeout(() => { this.adjustContentContainer() }, 500);
                }
                else {
                    partidas_resumen.classList.remove('d-flex');
                    partidas_resumen.classList.add('d-none');
                }
            }
        });

        // setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 500);
    },
    setKeyboardShortcuts()
    {
        document.addEventListener("keydown", (e) => {
            // console.log("key: "+ e.key + " | " + "code: " + e.code);
            if (e.key === "Escape") {
                e.preventDefault();
                window.open("/","_top");
            }
            if (e.key === "F5") {
                e.preventDefault();
                window.location.reload();
            }
        });
    },
    setConfigTables()
    {
        if (this.tableUnidades)
        {
            this.tableUnidades.AutoAddRow = false;
            this.tableUnidades.AutoDelRow = false;
            this.tableUnidades.EverMove = false;
        }
        if (this.tablePartidas && presupuesto)
        {
            presupuesto.table = this.tablePartidas;
            presupuesto.sumFields = ['autorizado','reserva','anual','p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11','p12'];
            presupuesto.excludeAnualFields = ['autorizado', 'anual'];
            presupuesto.onCalculeBranch = dataArray => this.updatePresupuestoData(dataArray);
            presupuesto.IsDirtyTable=()=>
            {
                const isDirty = this.isDirtyPresupuesto();
                this.showDirtyControls(isDirty);
            }
        }
        if (this.tableSubUnids)
        {
            this.tableSubUnids.AutoAddRow = false;
            this.tableSubUnids.AutoDelRow = false;
            this.tableSubUnids.EverMove = false;
        }
    },
    setEventTables()
    {
        if (this.tableUnidades)
        {
            const textSelected = document.querySelector('#unidad_selected');
            this.tableUnidades.Events[this.tableUnidades.EdiTable.Const.Events.BeforeCellFocus] = (e) =>
            {
                if (this.isDirtyPresupuesto()) {
                    if (!confirm('Se han realizado modificaciones en las partidas. ¿Desea descartar los cambios?'))
                        e.cancel = true;
                }
            };
            this.tableUnidades.Events[this.tableUnidades.EdiTable.Const.Events.EnterCell] = (e) =>
            {
                this.unidadSelected = this.tableUnidades.DataArray[e.sender.CurrentRowIndex()];
                if (textSelected) textSelected.textContent = (this.unidadSelected?.descripcion ?? '');
                this.presupuesto = null;

                this.getUnidad(this.unidadSelected.sys_pk, true);
                this.getPresupuestos(this.unidadSelected.sys_pk);
                this.showControls(['btn_add_unidad', 'btn_edit_unidad', 'btn_delete_unidad'], 'unidad_controls');
                this.printPartidaInfo(null);
                this.showPdaBtnStatus(null);
            };
            this.tableUnidades.Events[this.tableUnidades.EdiTable.Const.Events.BeforeMoveRow] = (e) =>
            {
                let data = {
                    sys_pk: e.source.sys_pk,
                    sys_recver: e.source.sys_recver,
                    superior: (e.child ? e.target.sys_pk : e.target.parentKey ?? '')
                }
                this.updateUnidad(data);
            };
        }

        if (this.tablePartidas && presupuesto)
        {
            let table = this.tablePartidas;
            const events = table.EdiTable.Const.Events;
            const pda_detail = document.getElementById("pda_detail");

            if (pda_detail) pda_detail.addEventListener("click", (e) => this.showPartidaDetail());

            // table.Events[events.RowChanged] = (e) =>
            // {
            //     let obj = table.DataArray[e.index];
            //     if (obj) {
            //         this.printPartidaInfo(obj);
            //         this.showPdaBtnStatus(obj);
            //     }
            // }

            presupuesto.events = events;
            presupuesto.setTableEvents();
            this.togglePartidasControl(false);
        }
    },
    setAjustPanelUnidadEvent()
    {
        const line = document.querySelector('#ajust_panel_unidad');
        if (line)
        {
            let pageX, unidadPanel, unidadPanelWidth;
            
            line.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            line.onmousedown = (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                unidadPanel = e.target.parentElement;
                unidadPanel.style.transition = 'none';
                unidadPanel.classList.remove('hidde-unidad');
                pageX = e.pageX;
                unidadPanelWidth = unidadPanel.offsetWidth;
            }
            document.onmousemove = (e) => {
                e.stopPropagation();
                if (unidadPanel) {
                    let diffX = (e.pageX - pageX);
                    unidadPanel.style.width = (unidadPanelWidth + diffX)+'px';
                }
            }
            document.onmouseup = (e) => {
                e.stopPropagation();
                if (unidadPanel) unidadPanel.style.transition = '.5s';
                unidadPanel = undefined;
                pageX = undefined;
                unidadPanelWidth = undefined;
            }
        }
    },
    toggleTabUnidades()
    {
        const tabUnidades = document.querySelector('#unidades_container');
        if (tabUnidades) tabUnidades.classList.toggle('hidde-unidad');
    },
    indentPartidaRow(add=true)
    {
        let index = this.tablePartidas.CurrentRowIndex();
        if (index < 0) return;
        
        // let dtarray = (this.tablePartidas?.DataArray??[]);
        // let partida = dtarray[index];

        const row = this.tablePartidas.GetTrByIndex(index);
        this.tablePartidas.RowIndent(row, add);
    },
    showPdaBtnStatus(partida)
    {
        const container = document.querySelector("#status_partidas_control");
        const buttons = container.querySelectorAll(".btn-status");

        if (!partida) {
            buttons.forEach(btn => btn.classList.toggle("hidde-control",true));
            return
        }

        const AllowStatus = (a,b) => {
            let config = (editor?.cfg_pda_status??"").trim().split(",");
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

        let isRoot = (Number(partida?.padre??0) === 0);
        buttons.forEach(btn => {
            let show = (isRoot && AllowStatus(partida.istatus,btn.getAttribute("status")));
            btn.classList.toggle("hidde-control", !show);
        });
    },
    showControls(listIds=[], containerId)
    {
        const container = document.querySelector('#'+containerId);

        if (container)
        {
            container.querySelectorAll('.control').forEach(control =>{
                control.classList.add('hidde-control');
            });

            listIds.forEach(id => {
                const control = container.querySelector('#'+id);
                if (control) control.classList.remove('hidde-control');
            });
        }
        editor.showControlsBtn();
    },
    showControlsBtn()
    {
        if(!editor.presupuesto) return;

        const btn_activar=document.getElementById("btn_activar");
        const btn_detener=document.getElementById("btn_detener");
        const btn_cerrar=document.getElementById("btn_cerrar");
        
        if(btn_activar)btn_activar.classList.add("hidde-control");
        if(btn_detener)btn_detener.classList.add("hidde-control");
        if(btn_cerrar)btn_cerrar.classList.add("hidde-control");
        
        switch(editor.presupuesto?.status??0)
        {
            case editor.stt_ppto_borrador:
            case editor.stt_ppto_detenido:
            case editor.stt_ppto_cerrado:
                if(btn_activar)
                {
                    btn_activar.classList.remove("hidde-control");
                    btn_activar.setAttribute("onclick","editor.Action('','PUT',{act:'activar'})");
                }
                break;
            case editor.stt_ppto_activo:
                if(btn_detener)
                {
                    btn_detener.classList.remove("hidde-control");
                    btn_detener.setAttribute("onclick","editor.Action('','PUT',{act:'detener'})");
                }
                if(btn_cerrar)
                {
                    btn_cerrar.classList.remove("hidde-control");
                    btn_cerrar.setAttribute("onclick","editor.Action('','PUT',{act:'cerrar'})");
                }
                break;
        }
    },
    Action(endpoint, method="PUT", values=null)
    {
        if(endpoint.trim()=="")
        {
            endpoint = editor.services['gop_presupuesto'];
            endpoint = endpoint.replace('@presupuesto', this.presupuesto.sys_pk);
        }
        main.request(endpoint, method, values,
            success => 
            { 
                this.presupuesto = success;
                this.printPresupuesto(this.presupuesto);
                this.getPartidas(this.presupuesto.sys_pk);
                
                editor.showControlsBtn();
            },
            failure => { alert('No se pudo completar el proceso.\n\n' + (failure.message??failure)); },
            false
        );
    },
    selectTabTable(btnTab)
    {
        const tables = document.querySelectorAll('#tables .t-table');
        const btntabs = document.querySelectorAll('#table_tabs .btn-tab');
        tables.forEach(table => table.classList.add('d-none'));
        btntabs.forEach(btn => btn.style.backgroundColor = 'transparent');
        btnTab.style.backgroundColor = '#FFF';
        const showTable = document.querySelector('#'+(btnTab.getAttribute('table')??'___'));
        
        if (showTable) {
            const controls = document.querySelector('#presupuesto_actions');
            showTable.classList.remove('d-none');
            
            if (showTable.id === "unidades_main_container") {
                controls.classList.add("hidde-control");
                this.printResumen();
            }
            else {
                controls.classList.remove("hidde-control");
                this.printPresupuesto(this.presupuesto);
            }
        }
    },
    onResize(e)
    {
        this.adjustContentContainer();
    },
    adjustContentContainer()
    {
        const container = document.querySelector('#content_container');
        const header = container.querySelector('#header');
        const content = container.querySelector('#content');
        const footer = container.querySelector('#footer');

        if (!container || !header || !content || !footer) return;

        let containerHeight = container.offsetHeight - (document.body.offsetHeight - window.innerHeight);
        let headerHeight = header.offsetHeight;
        let footerHeight = footer.offsetHeight;
        let contentHeight = containerHeight - (headerHeight + footerHeight);

        content.style.height = contentHeight + 'px';
    },
    observeAttributes(element, callback)
    {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    callback(mutation);
                }
            });
        });

        observer.observe(element, {
            attributes: true,
            subtree: false
        });

        return observer;
    },

    // =============== UNIDADES

    addAndUpdateUnidad()
    {
        let values = main.getValues('mdl_au_controls');
        if (values == null) return;

        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('@unidad', "_new");

        if (values.sys_pk) 
        {
            // Actualizar
            this.updateUnidad(values);
        }
        else
        {
            // Agregar
            main.request(endpoint, "POST", values,
                success => { 
                    this.getUnidades(); 
                    main.clearValues('mdl_au_controls'); 
                    main.closeModal('modal_add_unidades');
                },
                failure => { alert('No fue posible agregar la unidad.\n\n' + (failure.message??failure)); }, 
                false
            );
        }
    },
    updateUnidad(unidad)
    {
        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('@unidad', unidad.sys_pk);

        main.request(endpoint, 'PUT', unidad,
            success => { 
                // console.log(success);
                this.getUnidades();
                main.clearValues('mdl_au_controls'); 
                main.closeModal('modal_add_unidades');
            },
            failure => { alert('No fue posible actualizar la unidad.\n\n' + (failure.message??failure)); },
            false
        );
    },
    getUnidades()
    {
        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('/@unidad/', "?_view=");

        main.request(endpoint, 'GET', null,
            success => { 
                this.unidades = success;
                this.tableUnidades.DataArray = success;
                this.printUnidades(); 
            },
            failure => { alert('No fue posible obtener la unidades.\n\n' + (failure.message??failure)); },
            false
        );
    },
    getUnidad(unidad_pk, withSubUnidades=false)
    {
        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('@unidad', unidad_pk);

        if (withSubUnidades) endpoint += '/?details=true&ejercicio=' + this.ejercicio_select.value;

        main.request(endpoint, 'GET', null,
            success => { this.prepareSubUnidadesView(success); },
            failure => { console.log(failure); this.prepareSubUnidadesView(null); },
            false
        );
    },
    printUnidades(listUnidades)
    {
        if (!listUnidades) listUnidades = this.unidades;
        this.tableUnidades.DataArray = listUnidades;
        this.tableUnidades._printRows();
    },
    prepareSubUnidadesView(data)
    {
        const table_tabs = document.querySelector('#table_tabs');
        const btn_tab_subunidades = document.querySelector('#btn_tab_subunidades');
        const btn_tab_presupuesto = document.querySelector('#btn_tab_presupuesto');
        const unidades_main_container = document.querySelector('#unidades_main_container');
        const partidas_main_container = document.querySelector('#partidas_main_container');

        table_tabs.classList.add('d-none');
        unidades_main_container.classList.add('d-none');
        partidas_main_container.classList.add('d-none');
        btn_tab_subunidades.style.backgroundColor = 'transparent';
        btn_tab_presupuesto.style.backgroundColor = '#FFF';

        if (!data) return;
        let subunidades = (data?.subunidades??[]);

        if (subunidades.length > 0) {
            table_tabs.classList.remove('d-none');
        }
        this.printSubUnidades(subunidades);
    },
    printSubUnidades(subunidades)
    {
        this.tableSubUnids.DataArray = subunidades;
        this.tableSubUnids._printRows();
    },
    deleteUnidadSelected()
    {
        if (!this.unidadSelected || !confirm('¿Está seguro de eliminar la unidad seleccionada? Se eliminarán también sus presupuestos.'))
            return;

        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('@unidad', this.unidadSelected.sys_pk);

        main.request(endpoint, 'DELETE', null,
            success => { /*this.getUnidades();*/ },
            failure => { alert('No fue posible eliminar la unidad.\n\n' + (failure.message??failure)); },
            true
        );
    },
    load_unidad_modal(empty=false)
    {
        const ik_unidad = document.querySelector('#mdl_au_ik_unidad');
        let data = {}

        const setSuperior = (superior) => {
            let endpoint = editor.services['rh_unidad'];
            endpoint = endpoint.replace('@unidad',superior);

            main.request(endpoint, 'GET', null,
                success => { ik_unidad.setValue(success); },
                failure => { console.log(failure); },
                false
            );
        }

        ik_unidad.setValue(null);
        if (empty && this.unidadSelected) {
            setSuperior(this.unidadSelected.sys_pk);
        }
        if (!empty && this.unidadSelected) {
            data = this.unidadSelected;
            if (this.unidadSelected.superior) {
                setSuperior(this.unidadSelected.superior);
            }
        }

        main.setValues('mdl_au_controls', data);
    },

    // =============== PRESUPUESTO
    addOrEditPresupuesto()
    {
        let values = main.getValues('mdl_ap_controls');
        if (values == null) return;

        if (!this.unidadSelected) {
            alert('Debe seleccionar una unidad organizacional para continuar.');
            return;
        }

        let endpoint = editor.services['gop_presupuesto'];
        let method = 'POST';

        if (!this.presupuesto)
        {
            values['ref_unidad'] = this.unidadSelected.sys_pk;
            if (!values.ejercicio) values['ejercicio'] = Number(this.ejercicio_select.value);
            endpoint = endpoint.replace('@presupuesto', '_new');
        }
        else
        {
            endpoint = endpoint.replace('@presupuesto', this.presupuesto.sys_pk);
            method = 'PUT';
        }

        main.request(endpoint, method, values,
            success => {
                this.presupuesto = success;
                this.initPresupuesto();

                main.clearValues('mdl_ap_controls'); 
                main.closeModal('modal_presupuesto');
            },
            failure => { alert('No se pudo completar el proceso.\n\n' + (failure.message??failure)); },
            false
        );
    },
    getPresupuesto(unidadPK)
    {
        if (!unidadPK) return;

        let endpoint = editor.services['gop_presupuesto'];
        let ejercicio = this.ejercicio_select.value;
        endpoint = endpoint.replace('@presupuesto', unidadPK) + '/?_key=ref_unidad';
        endpoint += '&e=' + ejercicio;
        
        main.request(endpoint, 'GET', null,
            (success) => {
                this.presupuesto = success;
                this.initPresupuesto();
            },
            (failure) => {
                if (failure?.message?.includes('Elemento no encontrado')) {
                    this.presupuesto = null;
                    this.initPresupuesto();
                }
                else alert('No fue posible obtener el presupuesto.\n\n' + (failure.message ?? JSON.stringify(failure))); 
            },
            false
        );
    },
    initPresupuesto()
    {
        const presupuesto_controls = document.getElementById("presupuesto_controls");
        const div_ppto = document.getElementById("presupuestos");
        const div_pda = document.getElementById("partidas");

        if (this.presupuesto && Object.keys(this.presupuesto??{}).length > 0)
        {
            // div_ppto.innerHTML = "";
            div_ppto.classList.toggle("d-none",true);
            div_pda.classList.toggle("d-none",false);
            presupuesto_controls.classList.remove("hidde-control");
            this.ejercicio_select.value = this.presupuesto.ejercicio;
            this.showControls(['btn_seguimiento_presupuesto','edit_pre','delete_pre'], 'presupuesto_controls');
            this.printPresupuesto();
            this.getPartidas(this.presupuesto.sys_pk);
        }
        else
        {
            div_ppto.innerHTML = "";
            div_ppto.classList.toggle("d-none",false);
            div_pda.classList.toggle("d-none",true);
            presupuesto_controls.classList.add("hidde-control");
            this.showControls([], 'presupuesto_controls');
            this.printPresupuesto();
            this.tablePartidas.DataArray = [];
            this.partidasBackup = [];
            this.printPartidas();
        }
    },
    getPresupuestos(unidadPK)
    {
        if (!unidadPK) return;

        let ejercicio = this.ejercicio_select.value;
        let endpoint = editor.services['gop_presupuestos'];
        endpoint += '&u='+unidadPK;

        main.request(endpoint,'GET',null,
            (data) => {
                const div_ppto = document.getElementById("presupuestos");
                // const div_pda = document.getElementById("partidas");

                this.presupuestos = data;
                this.presupuesto = null;
                this.initPresupuesto();

                let cards = '';
                data.forEach((ppto) => {
                    cards += `
                    <div class="col-auto">
                        <a class="presupuesto-item" href="#" onclick="editor.selPresupuesto(${ppto.sys_pk})">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h5 class="card-title text-dark">${ppto.titulo}</h5>
                                    <h6 class="card-subtitle text-muted">${ppto.ejercicio}</h6>
                                </div>
                            </div>
                        </a>
                    </div>`;
                });
                if (cards == '') cards = '<h5 class="text-center text-muted">La unidad aún no cuenta con presupuestos</h5>';
                div_ppto.innerHTML = cards;
            },
            (error) => {
                this.presupuestos = [];
                alert(error.message ?? JSON.stringify(error));
            },
            false
        );
    },
    selPresupuesto(presupuestoPK)
    {
        if (!presupuestoPK) return;
        this.adjustContentContainer();

        let found = this.presupuestos.find(ppto => ppto.sys_pk == presupuestoPK);
        if (Object.keys(found).length > 0)
        {
            this.presupuesto = found;
            this.initPresupuesto();
        }
    },
    enableTablesSection(presupuesto)
    {
        if (!presupuesto) return;
        
        const tables_section = document.getElementById("tables");
        
        let disabled = (presupuesto.status == this.stt_ppto_detenido || presupuesto.status == this.stt_ppto_cerrado)
        tables_section.classList.toggle("disabled-all",disabled);
    },
    printPresupuesto(presupuesto)
    {
        if (!presupuesto) presupuesto = this.presupuesto;
        this.enableTablesSection(presupuesto);

        const container = document.querySelector('#presupuesto_container');
        container.style.opacity = 0;
        let template = '';

        if (presupuesto)
        {
            var btn_seguimiento_presupuesto=document.getElementById("btn_seguimiento_presupuesto");
            if(btn_seguimiento_presupuesto && editor.view_detail_preg)btn_seguimiento_presupuesto.setAttribute("href",editor.view_detail_preg.replace("{id}",presupuesto.sys_pk));

            this.fieldsPresupuesto.forEach(field => {
                let title = field.caption;
                let value = (presupuesto[field.id]??0);
                
                if (field.format) value = '$'+this.tablePartidas._format(Number(value), 2, true);

                template += `
                    <div class="presupuesto-box-info">
                        <small class="fw-5">${title}</small>
                        <p class="m-0">${value}</p>
                    </div>
                `;
            });

        }
        else
        {
            template = editor.template_add;
        }

        setTimeout(()=>{
            container.innerHTML = template;
            container.style.opacity = 1;
        },300);
    },
    printResumen()
    {
        const container = document.querySelector('#presupuesto_container');
        
        container.style.opacity = 0;
        let template = '';
        
        let resumen =
        {
            status_text: '',
            divisa_text: '',
            monto_autorizado: 0,
            monto_planeado: 0,
            monto_comprometido: 0,
            monto_ejercido: 0
        };

        (this.tableSubUnids.DataArray ?? []).forEach(row => {
            resumen.status_text = row.status;
            resumen.divisa_text = row.divisa;
            resumen.monto_autorizado = Math.add(resumen.monto_autorizado, row.monto_autorizado);
            resumen.monto_planeado = Math.add(resumen.monto_planeado, row.monto_planeado);
            resumen.monto_comprometido = Math.add(resumen.monto_comprometido, row.monto_comprometido);
            resumen.monto_ejercido = Math.add(resumen.monto_ejercido, row.monto_ejercido);
        });
        // console.log(this.tableSubUnids.DataArray)
        
        this.fieldsResumen.forEach(field => {
            let value = resumen[field.id]??"";
            if (field.format) value = '$'+this.tableSubUnids._format(Number(value), 2, true);

            template += `
                <div class="presupuesto-box-info">
                    <small class="fw-5">${field.caption}</small>
                    <p class="m-0">${value}</p>
                </div>
            `;
        });

        setTimeout(()=>{
            container.innerHTML = template;
            container.style.opacity = 1;
        },300);
    },
    deletePresupuesto(presupuesto)
    {
        if (!presupuesto) presupuesto = this.presupuesto;
        if (!presupuesto) {
            alert('No hay presupuesto para eliminar');
            return;
        }
        if (!confirm('Está seguro de eliminar el presupuesto y todas sus partidas de la unidad organizacional seleccionada?')) return;

        let endpoint = editor.services['gop_presupuesto'];
        endpoint = endpoint.replace('@presupuesto', presupuesto.sys_pk);

        main.request(endpoint, 'DELETE', null,
            success => { 
                this.presupuesto = null; 
                this.printPresupuesto();
                this.tablePartidas.DataArray = [];
                this.partidasBackup = [];
                this.printPartidas();
            },
            failure => 
            {
                alert('No fue posible eliminar el presupuesto.\n\n' + (failure.message??failure)); 
            },
            false
        );
    },
    updatePresupuestoData(dataArray)
    {
        let dataCopy = JSON.parse(JSON.stringify(dataArray));
        if (this.presupuesto && dataCopy)
        {
            let autorzad = 0;
            let planeado = 0;

            dataCopy.forEach(data => {
                autorzad = Math.add(autorzad, Number(data.autorizado??0));
                planeado = Math.add(planeado, Number(data.anual??0));
            });

            this.presupuesto['monto_autorizado'] = autorzad;
            this.presupuesto['monto_planeado'] = planeado;

            this.printPresupuesto();
            this.summarizeByMonths();
        }

        const isDirty = this.isDirtyPresupuesto();
        this.showDirtyControls(isDirty);
    },
    isDirtyPresupuesto()
    {
        if (this.tablePartidas.DataArray && this.partidasBackup) 
        {
            const partidas = this.tablePartidas.DataArray;
            const backup = this.partidasBackup ?? [];
            
            if (partidas.length == 0 && backup.length == 0) return false;
            if (partidas.length != backup.length) return true;

            const mapPartidas = new Map(partidas.map(p => [p.sys_pk, p]));
            const mapBackup = new Map(backup.map(b => [b.sys_pk, b]));

            let isDirty = false;
            for (const [id, pda] of mapPartidas) {
                const bkp = mapBackup.get(id);
                console.log(id, pda, bkp);

                if (JSON.stringify(pda) !== JSON.stringify(bkp)) {
                    isDirty = true;
                    break;
                }
            }

            return isDirty;
        }
        
        return false;
    },
    showDirtyControls(isDirty=true)
    {
        /* let showControls = [];
        if (isDirty) {
            showControls = ['disc_pre','save_pre'];
        }
        this.showControls(showControls, 'partidas_control'); */
    },
    load_presupuesto_modal()
    {
        let presupuesto = (this.presupuesto ?? {});
        let isnew = ((presupuesto?.sys_pk??0) == 0);
        let ejercicio = this.ejercicio_select.value;

        const pptos_list = document.getElementById("copy-ppto-from");
        if (this.presupuestos.length > 0) {
            let last_ppto = this.presupuestos[(this.presupuestos.length - 1)];
            ejercicio = (last_ppto.ejercicio + 1);
        }

        document.getElementById("modal_presupuesto_title").textContent = (isnew) ? "Nuevo presupuesto" : "Editar presupuesto";
        if (isnew) document.querySelector("#modal_presupuesto select[name='ejercicio']").setAttribute("default",ejercicio);
        document.querySelector("#modal_presupuesto select[name='divisa']").disabled = !isnew;
        
        pptos_list.innerHTML = `<option value="0" divisa="${this.dvspred?.sys_pk??1}">Ninguno</option>`;
        if (isnew) {
            this.presupuestos.forEach(ppto => {
                const option = document.createElement("option");
                option.value = ppto.sys_pk;
                option.text = ppto.titulo + ` [${ppto.ejercicio}/${ppto.divisa_text}]`;
                option.setAttribute("divisa",ppto.divisa);

                pptos_list.appendChild(option);
            });
        }

        main.setValues('modal_presupuesto', presupuesto);
    },
    selOptStruct(option)
    {
        const sel_moneda = document.querySelector("#modal_presupuesto select[name='divisa']");
        sel_moneda.value = option.getAttribute("divisa") ?? this.dvspred.sys_pk;
        sel_moneda.disabled = (Number(option?.value??0) > 0)
    },

    // =============== PARTIDAS
    getPartidas(presupuestoPK)
    {
        let endpoint = editor.services['gop_partida'];
        endpoint = endpoint.replace('/@partida/', '?_view=') + `&presupuesto=${presupuestoPK}`;
        main.request(endpoint, 'GET', null,
            success => {
                this.tablePartidas.DataArray = JSON.parse(JSON.stringify(success));
                this.showDirtyControls(false);
                this.printPartidas();
                this.setPartidasBackup();
            },
            failure => { 
                alert('No fue posible obtener las partidas.\n\n' + (failure.message??failure)); 
                this.tablePartidas.DataArray = [];
                this.printPartidas();
                this.setPartidasBackup();
            },
            false
        );
    },
    printPartidas()
    {
        const partidas_main_container = document.querySelector('#partidas_main_container');
        const btn_tab_presupuesto = document.querySelector('#btn_tab_presupuesto');
        partidas_main_container.style.opacity = 0;

        if (this.tablePartidas.DataArray && this.tablePartidas.DataArray.length > 0)
        {
            this.tablePartidas.DataArray.forEach(data => {
                presupuesto.calculeAnualFromDataRow(data);
            });
        }

        setTimeout(()=>{
            this.tablePartidas._printTreeData();
            // this.tablePartidas._printRows();
            partidas_main_container.style.opacity = 1;
            this.summarizeByMonths();
        },200);

        partidas_main_container.classList.toggle('d-none', (this.presupuesto ? false : true));
        btn_tab_presupuesto.classList.toggle('d-none', (this.presupuesto ? false : true));
    },
    summarizeByMonths()
    {
        if (!this.tablePartidas) {
            console.warn("No se encontro la tabla de las partidas");
            return
        }

        const partidas_resumen = document.querySelector('#partidas_resumen');

        let dataArray = this.tablePartidas.DataArray;
        let summary = {reserva:0, p01:0, p02:0, p03:0, p04:0, p05:0, p06:0, p07:0, p08:0, p09:0, p10:0, p11:0, p12:0};

        for (let i = 0; i < dataArray.length; i++) {
            const row = dataArray[i];
            // Solo sumar las partidas raíz (sin padre)
            if (row.padre!=null || row.padre!=undefined) continue;
            
            summary.reserva = Math.add(summary.reserva, Number(row.reserva));
            summary.p01 = Math.add(summary.p01, Number(row.p01));
            summary.p02 = Math.add(summary.p02, Number(row.p02));
            summary.p03 = Math.add(summary.p03, Number(row.p03));
            summary.p04 = Math.add(summary.p04, Number(row.p04));
            summary.p05 = Math.add(summary.p05, Number(row.p05));
            summary.p06 = Math.add(summary.p06, Number(row.p06));
            summary.p07 = Math.add(summary.p07, Number(row.p07));
            summary.p08 = Math.add(summary.p08, Number(row.p08));
            summary.p09 = Math.add(summary.p09, Number(row.p09));
            summary.p10 = Math.add(summary.p10, Number(row.p10));
            summary.p11 = Math.add(summary.p11, Number(row.p11));
            summary.p12 = Math.add(summary.p12, Number(row.p12));
        }

        Object.entries(summary).forEach(([key, value]) => {
            const span = partidas_resumen.querySelector('#total_'+key);
            if (span) {
                let fv = this.tablePartidas._format(Number(value), 2, true);
                span.textContent = "$"+fv;
            }
        });
    },
    addRowPartida()
    {
        this.tablePartidas.AddRow();
    },
    insertRowPartida(moveAsChild=false, onTopIfNotAsChild=true)
    {
        if (this.tablePartidas.DataArray && this.tablePartidas.DataArray.length > 0)
        {
            this.tablePartidas.InsertRow(undefined, true);
            let newRow = this.tablePartidas.DataArray[this.tablePartidas.DataArray.length-1];
            let curRow = this.tablePartidas.DataArray[this.tablePartidas.CurrentRowIndex()];

            if (newRow && curRow)
            {
                let options = this.tablePartidas._getTreeOptions();
                if(this.tablePartidas._moveData(newRow, curRow, moveAsChild, options, onTopIfNotAsChild))
                {
                    this.tablePartidas._printTreeData();
                    // this.tablePartidas._printRows();
                    let newRowIdx = this.tablePartidas.DataArray.findIndex(data => data[options.key] == (newRow[options.key]??'_-_'));
                    if (newRowIdx >= 0) {
                        let nr = this.tablePartidas.GetTrByIndex(newRowIdx);
                        this.tablePartidas.CellFocus(nr.cells[0]);
                    }
                }
            }
        }
        else
        {
            this.addRowPartida();
        }
    },
    addRowBroPartida(){ this.insertRowPartida(false,false); },
    addRowSonPartida(){ this.insertRowPartida(true,false); },
    deleteRowPartida()
    {
        if (!this.presupuesto) {
            console.warn("No se encontro el presupuesto de la partida");
            return
        }
        if (!this.tablePartidas) {
            console.warn("La tabla de las partidas no esta definida");
            return
        }

        let index = this.tablePartidas.CurrentRowIndex();        
        
        if (index < 0) return;
        if (!confirm("¿Está seguro que desea eliminar la partida seleccionada?\r\nSe eliminaran las partidas hijas\r\nEste proceso es irreversible")) return;

        let dtarray = (this.tablePartidas?.DataArray??[]);
        let partida = dtarray[index];
        let sys_pk = Number(partida?.sys_pk??"0");

        if (isNaN(sys_pk) || sys_pk < 1) {
            this.cascadingDelete(this.tablePartidas, partida);
            return
        }
        let endpoint = (editor.services["gop_partida"]).replace("@partida",sys_pk);

        main.request(endpoint,"DELETE",null,
            (success) => {
                this.getPresupuesto(this.unidadSelected.sys_pk);
            },
            (failure) => {
                alert(failure.message ?? JSON.stringify(failure));
            },
            false
        );
    },
    cascadingDelete(table,node)
    {
        const op = table._getTreeOptions();
        let nodeId = node[op.key];
        
        let childs = table.DataArray.filter(row => row[op.parentkey] == nodeId);
        for (let i = 0; i < childs.length; i++) {
            this.cascadingDelete(table,childs[i]);
        }

        const index = table.DataArray.findIndex(obj => obj[op.key] == nodeId);
        if (index != -1) table.DeleteRow(index);
    },
    setPartidasBackup()
    {
        this.partidasBackup = JSON.parse(JSON.stringify(this.tablePartidas.DataArray));
    },
    togglePartidasControl(editMode)
    {
        if (!this.tablePartidas) {
            console.warn("La tabla de las partidas no esta definida");
            return
        }

        const presupuesto_controls = document.getElementById("presupuesto_controls");
        const table_partidas_control = document.getElementById("table_partidas_control");
        const status_partidas_control = document.getElementById("status_partidas_control");

        if (editMode) {
            presupuesto_controls.classList.add("hidde-control");
            table_partidas_control.classList.remove("hidde-control");
            status_partidas_control.classList.add("hidde-control");
            this.showControls(["save_pre","disc_pre"],"partidas_control");
            
            this.tablePartidas.ReadOnly = false;
            this.tablePartidas.AutoAddRow = true;
            this.tablePartidas.AutoDelRow = true;
            //Se controla el desplazamiento de filas desde el evento 'BeforeMoveRow'
        }
        else
        {
            presupuesto_controls.classList.remove("hidde-control");
            table_partidas_control.classList.add("hidde-control");
            status_partidas_control.querySelectorAll(".btn-status").forEach((btn) => { btn.classList.add("hidde-control") });
            status_partidas_control.classList.remove("hidde-control");
            this.showControls(["enable_edit_partidas"],"partidas_control");
            this.printPartidaInfo(null);
            
            this.tablePartidas.ReadOnly = true;
            this.tablePartidas.AutoAddRow = false;
            this.tablePartidas.AutoDelRow = false;
            //Se controla el desplazamiento de filas desde el evento 'BeforeMoveRow'
        }
    },
    savePartidasPresupuesto()
    {
        if (!this.presupuesto) {
            alert('No hay presupuesto para guardar');
            return;
        }

        let data = {
            sys_pk: this.presupuesto.sys_pk,
            sys_recver: this.presupuesto.sys_recver
        }

        if (this.presupuesto['monto_autorizado'] != undefined) data['monto_autorizado'] = Number(this.presupuesto['monto_autorizado']);
        if (this.presupuesto['monto_planeado'] != undefined) data['monto_planeado'] = Number(this.presupuesto['monto_planeado']);

        data['partidas'] = this.tablePartidas.DataArray;
        // console.log(data);
        let endpoint = editor.services['gop_presupuesto'];
        endpoint = endpoint.replace('@presupuesto', this.presupuesto.sys_pk);
        
        main.request(endpoint, 'PUT', data,
            success => { 
                this.presupuesto = success;
                this.setPartidasBackup();
                this.getPartidas(this.presupuesto.sys_pk);
                // this.showDirtyControls(false);
                this.togglePartidasControl(false);
            },
            failure => { alert('No fue posible guardar las partidas del presupuesto.\n\n' + (failure.message??failure)); },
            false
        );
    },
    discardPartidasPresupuesto()
    {
        if (!confirm('¿Está seguro de descartar todos los cambios del presupuesto realizados en la tabla de partidas?'))
            return;

        if (this.partidasBackup)
        {
            this.tablePartidas.DataArray = JSON.parse(JSON.stringify(this.partidasBackup));
            let temp = JSON.parse(JSON.stringify(this.tablePartidas.DataArray));
            let tree = this.tablePartidas.TreeArray(temp);
            this.updatePresupuestoData(tree);
            this.printPartidas();
        }
        // this.showDirtyControls(false);
        this.togglePartidasControl(false);
    },
    changePartidaStatus(btnStatus)
    {
        if (!this.presupuesto) {
            console.warn("No se encontro el presupuesto de la partida");
            return
        }
        if (!this.tablePartidas) {
            console.warn("La tabla de las partidas no esta definida");
            return
        }

        let index = this.tablePartidas.CurrentRowIndex();        
        if (index < 0) {
            alert("Es necesario seleccionar un elemento de la lista.");
            return
        }

        let nstatus = Number(btnStatus.getAttribute("status"));

        let cfg_status = (editor.cfg_pda_stt_color[nstatus]??{});
        let message = (cfg_status?.text??"" != "")
            ? `¿Está seguro que desea establecer la partida seleccionada en "${cfg_status?.text}"?`
            : "¿Está seguro que desea cambiar el estado de la partida seleccionada?";
        message += "\r\nEl nuevo estado se aplicará a las partidas hijas";
        if (!confirm(message)) return;

        let dtarray = (this.tablePartidas?.DataArray??[]);
        let partida = dtarray[index];
        let params = { status: nstatus, presupuesto: this.presupuesto.sys_pk }

        let endpoint = (editor.services["change_pda_status"]).replace("@partida",(partida?.sys_pk??0));
        endpoint = InduxsoftCrudlModel.UrlReplace(endpoint,params);

        btnStatus.disabled = true;
        main.request(endpoint,"PUT",null,
            (success) => {
                if (nstatus == editor.stt_pda_cancelada)
                {
                    this.getPresupuesto(this.unidadSelected.sys_pk);
                    this.printPartidaInfo(null);
                    this.showPdaBtnStatus(null);
                }
                else
                {
                    this.getPartidas(this.presupuesto.sys_pk);
                    this.printPartidaInfo(success);
                    this.showPdaBtnStatus(success);
                }

                btnStatus.disabled = false;
            },
            (failure) => {
                alert(failure.message ?? JSON.stringify(failure));
                btnStatus.disabled = false;
            },
            false
        );
    },
    printPartidaInfo(partida)
    {
        const pda_title = document.getElementById("pda_title");
        const pda_status = document.getElementById("pda_status_text");
        const pda_detail = document.getElementById("pda_detail");

        if (!partida) {
            pda_title.textContent = "Item";
            pda_status.textContent = "";
            pda_detail.classList.add("hidde-control");
            return
        }

        let cfg_status = editor.cfg_pda_stt_color[partida.istatus] ?? {};
        let clases = ["badge","text-wrap",...(cfg_status?.class??"").split(" ")];

        pda_title.textContent = partida?.partida ?? "Item";
        pda_status.textContent = cfg_status?.text ?? "";
        pda_detail.classList.remove("hidde-control");

        pda_status.removeAttribute("class");
        clases.forEach(cls => { if (cls.trim()!="") pda_status.classList.add(cls); });
        pda_status.style.backgroundColor = cfg_status?.color ?? "";
    },
    showPartidaDetail()
    {
        if (!this.tablePartidas) {
            console.warn("La tabla de las partidas no esta definida");
            return
        }

        let array = (this.tablePartidas?.DataArray??[]);
        let index = this.tablePartidas.CurrentRowIndex();
        
        if (index < 0) {
            alert("Es necesario seleccionar un elemento de la lista.");
            return
        }

        let obj = array[index];
        let pk = (Number(obj?.sys_pk??0) || 0);

        if (pk <= 0) {
            alert("Es necesario guardar la partida para acceder a sus detalles.");
            return
        }

        window.location.href = "/!/pregop/gop_partida/"+pk+"/"
    },
    showTransferPartidaModal()
    {
        if (!this.tablePartidas) {
            console.warn("La tabla de las partidas no esta definida");
            return
        }
        
        let index = this.tablePartidas.CurrentRowIndex();
        if (index < 0) return;
        
        let partida = this.tablePartidas.DataArray[index];
        let sys_pk = Number(partida?.sys_pk??"0");
        
        if (isNaN(sys_pk) || sys_pk < 1) {
            alert("No se puede transferir una partida sin guardar.");
            return
        }
        
        const partida_tile = document.querySelector('#modal_tr_partida #tr_partida_title');
        const partida_sys_pk = document.querySelector('#modal_tr_partida input[name="partida"]');

        partida_tile.textContent = partida.partida;
        partida_sys_pk.value = sys_pk;

        tools.showModal('modal_tr_partida');
    },
    onBeforeSearchPresupuesto(search)
    {
        const ik_u = document.querySelector('#ik_tr_unidad');

        let unidad = (ik_u?.getValue()?.sys_pk) || this.unidadSelected?.sys_pk;
        if (!unidad) {
            alert("Debe seleccionar una unidad organizacional para continuar.");
            return "";
        }

        let endpoint = editor.services['gop_presupuestos'];
        endpoint += '&u=' + unidad;
        endpoint += '&t=' + search;

        return endpoint
    },
    transferPartida()
    {
        let data = main.getValues('modal_tr_partida');

        if (!data || this.req_tr_pda) return;
        if (!data?.partida) {
            alert("No se selecciono una partida a transferir");
            return
        }
        if (!data?.presupuesto) {
            alert("Debe seleccionar un presupuesto y/o unidad destino para continuar.");
            return
        }
        if (data.presupuesto == this.presupuesto.sys_pk) {
            alert("No se puede transferir la partida al mismo presupuesto.");
            return
        }
        if (!confirm("¿Está seguro que desea transferir la partida seleccionada?")) return;

        let partida_sys_pk = Number(data.partida);
        let endpoint = (editor.services["transfer_partida"]).replace("@partida",partida_sys_pk);
        this.req_tr_pda = true;

        main.request(endpoint, "PATCH", data,
            (success) => {
                if (success?.message) {
                    alert(success.message);
                }
                this.getPartidas(this.presupuesto.sys_pk);
                this.getPresupuesto(this.unidadSelected.sys_pk);
                this.togglePartidasControl(false);
                this.req_tr_pda = false;
                main.clearValues('modal_tr_partida');
                tools.hideModal('modal_tr_partida');
            },
            (failure) => {
                if (failure.message) alert(failure.message);
                else console.error(JSON.stringify(failure));
                this.req_tr_pda = false;
            },
            false
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});
