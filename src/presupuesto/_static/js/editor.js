var editor = 
{
    tableUnidades: null, 
    tablePartidas: null,
    tableSubUnids: null,
    unidades: [], 
    unidadSelected: null, 
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

    init()
    {
        this.tableUnidades = document.querySelector('#treeUnidades');
        this.tablePartidas = document.querySelector('#treePartidas');
        this.tableSubUnids = document.querySelector('#tableSubUnids');

        this.setConfigTables();
        this.setEventTables();
        this.setAjustPanelUnidadEvent();

        this.ejercicio_select = document.querySelector('#ejercicio_select');
        const modal_presupuesto = document.querySelector('#modal_presupuesto');
        const btn_add_unidad = document.querySelector('#btn_add_unidad');
        const btn_edit_unidad = document.querySelector('#btn_edit_unidad');
        const btn_tab_subunidades = document.querySelector('#btn_tab_subunidades');
        const btn_tab_presupuesto = document.querySelector('#btn_tab_presupuesto');

        if (this.ejercicio_select) this.ejercicio_select.addEventListener('change', () => {
            this.getUnidad(this.unidadSelected?.sys_pk??null, true);
            this.getPresupuesto(this.unidadSelected?.sys_pk??null) 
        });
        if (modal_presupuesto) modal_presupuesto.addEventListener('show.bs.modal', () => { this.load_presupuesto_modal(); });
        if (btn_add_unidad) btn_add_unidad.addEventListener('click', () => { this.load_unidad_modal(true) });
        if (btn_edit_unidad) btn_edit_unidad.addEventListener('click', () => { this.load_unidad_modal(false) });
        if (btn_tab_subunidades) btn_tab_subunidades.addEventListener('click', () => this.selectTabTable(btn_tab_subunidades));
        if (btn_tab_presupuesto) btn_tab_presupuesto.addEventListener('click', () => this.selectTabTable(btn_tab_presupuesto));
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
                this.getUnidad(this.unidadSelected.sys_pk, true);
                this.getPresupuesto(this.unidadSelected.sys_pk);
                this.showControls(['btn_add_unidad', 'btn_edit_unidad', 'btn_delete_unidad'], 'unidad_controls');
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
            presupuesto.events = this.tablePartidas.EdiTable.Const.Events;
            presupuesto.setTableEvents();
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
        const row = this.tablePartidas.GetTrByIndex(this.tablePartidas.CurrentRowIndex());
        if (row) this.tablePartidas.RowIndent(row, add);
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
            showTable.classList.remove('d-none');
        }
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
                failure => { alert('No fue posible agregar la unidad.\n\n' + failure); }, 
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
                console.log(success);
                this.getUnidades();
                main.clearValues('mdl_au_controls'); 
                main.closeModal('modal_add_unidades');
            },
            failure => { alert('No fue posible actualizar la unidad.\n\n' + failure); },
            false
        );
    },
    getUnidades()
    {
        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('/@unidad/', "?view=");

        main.request(endpoint, 'GET', null,
            success => { 
                this.unidades = success.unidades;
                this.tableUnidades.DataArray = success.unidades;
                this.printUnidades(); 
            },
            failure => { alert('No fue posible obtener la unidades.\n\n' + failure); },
            false
        );
    },
    getUnidad(unidad_pk, withSubUnidades=false)
    {
        let endpoint = editor.services['rh_unidad'];
        endpoint = endpoint.replace('@unidad', unidad_pk);

        if (withSubUnidades) endpoint += '?details=true&ejercicio=' + this.ejercicio_select.value;

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
            failure => { alert('No fue posible eliminar la unidad.\n\n' + failure); },
            true
        );
    },
    load_unidad_modal(empty=false)
    {
        let data = {}
        const ik_unidad = document.querySelector('#mdl_au_ik_unidad');
        ik_unidad.setValue(null);

        if (!empty && this.unidadSelected)
        {
            data = this.unidadSelected;
            if (this.unidadSelected.superior)
            {
                let endpoint = editor.services['rh_unidad'];
                endpoint = endpoint.replace('@unidad', this.unidadSelected.superior);

                main.request(endpoint, 'GET', null,
                    success => { ik_unidad.setValue(success); },
                    failure => { console.log(failure); },
                    false
                );
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
            values['ejercicio'] = Number(this.ejercicio_select.value);
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
                this.printPresupuesto(this.presupuesto);
                this.getPartidas(this.presupuesto.sys_pk);
                main.clearValues('mdl_ap_controls'); 
                main.closeModal('modal_presupuesto');
            },
            failure => { alert('No se pudo completar el proceso.\n\n' + failure); },
            false
        );
    },
    getPresupuesto(unidadPK)
    {
        if (!unidadPK) return;

        let endpoint = editor.services['gop_presupuesto'];
        endpoint = endpoint.replace('@presupuesto', unidadPK) + '?_key=ref_unidad';
        endpoint += '&e=' + this.ejercicio_select.value;

        main.request(endpoint, 'GET', null,
            success => { 
                this.showControls(['edit_pre','delete_pre'], 'presupuesto_controls');
                this.presupuesto = success;
                this.printPresupuesto();
                this.getPartidas(this.presupuesto.sys_pk);
            },
            failure => {
                if (failure?.message?.includes('Elemento no encontrado')) {
                    this.showControls([], 'presupuesto_controls');
                    this.presupuesto = null;
                    this.printPresupuesto();
                    this.tablePartidas.DataArray = [];
                    this.partidasBackup = [];
                    this.printPartidas();
                }
                else alert('No fue posible obtener el presupuesto.\n\n' + failure); 
            },
            false
        );
    },
    printPresupuesto(presupuesto)
    {
        if (!presupuesto) presupuesto = this.presupuesto;

        const container = document.querySelector('#presupuesto_container');
        container.style.opacity = 0;
        let template = '';

        if (presupuesto)
        {
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
            template = `
                <small class="text-secondary w-100">La unidad aún no cuenta con presupuesto</small>
                <button class="btn btn-sm btn-primary py-1 d-flex align-items-center gap-2 my-3" data-bs-toggle="modal" data-bs-target="#modal_presupuesto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                    Agregar presupuesto
                </button>
            `;
        }

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
                this.printPartidas();
            },
            failure => { alert('No fue posible eliminar el presupuesto.\n\n' + failure); },
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
        }

        const isDirty = this.isDirtyPresupuesto();
        this.showDirtyControls(isDirty);
    },
    isDirtyPresupuesto()
    {
        let isDirty = false;

        if (!isDirty && this.tablePartidas.DataArray && this.partidasBackup) {
            let partidas = JSON.parse(JSON.stringify(this.tablePartidas.DataArray));
            isDirty = (JSON.stringify(this.tablePartidas.TableArray(partidas)) !== JSON.stringify(this.partidasBackup));
        }

        return isDirty;
    },
    showDirtyControls(isDirty=true)
    {
        let showControls = [];
        if (isDirty) {
            showControls = ['disc_pre','save_pre'];
        }
        this.showControls(showControls, 'partidas_control');
    },
    load_presupuesto_modal()
    {
        let presupuesto = (this.presupuesto ?? {});
        main.setValues('modal_presupuesto', presupuesto);
    },

    // =============== PARTIDAS
    getPartidas(presupuestoPK)
    {
        let endpoint = editor.services['gop_partida'];
        endpoint = endpoint.replace('/@partida/', '?view=') + `&presupuesto=${presupuestoPK}`;
        main.request(endpoint, 'GET', null,
            success => {
                this.tablePartidas.DataArray = JSON.parse(JSON.stringify(success));
                this.showDirtyControls(false);
                this.printPartidas();
                this.setPartidasBackup();
            },
            failure => { 
                alert('No fue posible obtener las partidas.\n\n' + failure); 
                this.tablePartidas.DataArray = [];
                this.printPartidas();
                this.setPartidasBackup();
            },
            false
        );
    },
    printPartidas()
    {
        const container = document.querySelector('#partidas_main_container');
        container.style.opacity = 0;

        if (this.tablePartidas.DataArray && this.tablePartidas.DataArray.length > 0)
        {
            this.tablePartidas.DataArray.forEach(data => {
                presupuesto.calculeAnualFromDataRow(data);
            });
        }

        setTimeout(()=>{
            this.tablePartidas._printRows();
            container.style.opacity = 1;
        },200);

        const partidas_main_container = document.querySelector('#partidas_main_container');
        const btn_tab_presupuesto = document.querySelector('#btn_tab_presupuesto');

        partidas_main_container.classList.toggle('d-none', (this.presupuesto ? false : true));
        btn_tab_presupuesto.classList.toggle('d-none', (this.presupuesto ? false : true));
    },
    addRowPartida()
    {
        this.tablePartidas.AddRow();
    },
    insertRowPartida()
    {
        if (this.tablePartidas.DataArray && this.tablePartidas.DataArray.length > 0)
        {
            this.tablePartidas.InsertRow(undefined, true);
            let newRow = this.tablePartidas.DataArray[this.tablePartidas.DataArray.length-1];
            let curRow = this.tablePartidas.DataArray[this.tablePartidas.CurrentRowIndex()];

            if (newRow && curRow)
            {
                let options = this.tablePartidas._getTreeOptions();
                if(this.tablePartidas._moveData(newRow, curRow, false, options, true))
                {
                    this.tablePartidas._printRows();
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
    deleteRowPartida()
    {
        this.tablePartidas.DeleteCurrentRow();
    },
    setPartidasBackup()
    {
        this.partidasBackup = JSON.parse(JSON.stringify(this.tablePartidas.DataArray));
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

        let endpoint = editor.services['gop_presupuesto'];
        endpoint = endpoint.replace('@presupuesto', this.presupuesto.sys_pk);
        
        main.request(endpoint, 'PUT', data,
            success => { 
                this.presupuesto = success;
                this.setPartidasBackup();
                this.showDirtyControls(false);
            },
            failure => { alert('No fue posible guardar las partidas del presupuesto.\n\n' + failure); },
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
        this.showDirtyControls(false);
    },
}

document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});
