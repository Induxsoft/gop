var editor = 
{
    tableUnidades: null, 
    tablePartidas: null,
    unidades: [], 
    unidadSelected: null, 
    presupuesto: null, 
    partidas: [],
    partidasBackup: [],
    headerFields: { 
        titulo:'Título:', 
        status_text:'Estado:', 
        divisa_text:'Moneda', 
        monto_autorizado:'Autorizado:', 
        monto_planeado:'Planeado:', 
        monto_comprometido:'Comprometido:', 
        monto_ejercido:'Ejercido:',
        notas:'Notas:'
    },

    init()
    {
        this.tableUnidades = document.querySelector('#treeUnidades');
        this.tablePartidas = document.querySelector('#treePartidas');
        this.setConfigTables();
        this.setEventTables();
        this.setAjustPanelUnidadEvent();

        const ejercicio_select = document.querySelector('#ejercicio_select');
        const modal_presupuesto = document.querySelector('#modal_presupuesto');
        if (ejercicio_select) ejercicio_select.addEventListener('change', e => { this.getPresupuesto(this.unidadSelected?.sys_pk??null) });
        if (modal_presupuesto) modal_presupuesto.addEventListener('show.bs.modal', e => { this.load_presupuesto_modal(); });
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
    },
    setEventTables()
    {
        if (this.tableUnidades)
        {
            const textSelected = document.querySelector('#unidad_selected');
            this.tableUnidades.Events[this.tableUnidades.EdiTable.Const.Events.EnterCell] = (e) =>
            {
                this.unidadSelected = this.tableUnidades.DataArray[e.sender.CurrentRowIndex()];
                if (textSelected) textSelected.textContent = (this.unidadSelected?.descripcion ?? '');
                this.getPresupuesto(this.unidadSelected.sys_pk);
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

    // =============== UNIDADES

    addUnidad()
    {
        let values = main.getValues('mdl_au_controls');

        let endpoint = editor.services['rh_unidad'];
        endpoint += '/_new';

        main.request(endpoint, 'POST', values,
            success => { 
                this.getUnidades(); 
                main.clearValues('mdl_au_controls'); 
                main.closeModal('modal_add_unidades')
            },
            failure => { alert('No fue posible agregar la unidad.\n\n' + failure); }
        );
    },
    getUnidades()
    {
        let endpoint = editor.services['rh_unidad'];

        main.request(endpoint, 'GET', null,
            success => { this.unidades = success; this.printUnidades(); },
            failure => { alert('No fue posible obtener la unidades.\n\n' + failure); }
        );
    },
    printUnidades(listUnidades)
    {
        if (!listUnidades) listUnidades = this.unidades;
        this.tableUnidades.DataArray = listUnidades;
        this.tableUnidades._printRows();
    },
    deleteUnidadSelected()
    {
        if (!this.unidadSelected || !confirm('¿Está seguro de eliminar la unidad seleccionada?'))
            return;

        let endpoint = editor.services['rh_unidad'];
        endpoint += "/" + this.unidadSelected.sys_pk;

        main.request(endpoint, 'DELETE', null,
            success => { this.getUnidades(); },
            failure => { alert('No fue posible eliminar la unidad.\n\n' + failure); }
        );
    },

    // =============== PRESUPUESTO
    addOrEditPresupuesto()
    {
        let values = main.getValues('mdl_ap_controls');

        if (!this.unidadSelected) {
            alert('Debe seleccionar una unidad organizacional para continuar.');
            return;
        }

        const ejercicio_select = document.querySelector('#ejercicio_select');

        let endpoint = editor.services['gop_presupuesto'];

        if (!this.presupuesto)
        {
            values['ref_unidad'] = this.unidadSelected.sys_pk;
            values['ejercicio'] = Number(ejercicio_select.value);
            endpoint += '/_new';
        }
        else
        {
            endpoint += '/' + this.presupuesto.sys_pk;
        }
        console.log(values);
        main.request(endpoint, 'POST', values,
            success => { 
                this.presupuesto = success;
                this.printPresupuesto(this.presupuesto);
                this.getPartidas(this.presupuesto.sys_pk);
                main.clearValues('mdl_ap_controls'); 
                main.closeModal('modal_presupuesto');
            },
            failure => { alert('No se pudo completar el proceso.\n\n' + failure); }
        );
    },
    getPresupuesto(unidadPK)
    {
        if (!unidadPK) return;

        let endpoint = editor.services['gop_presupuesto'] + `/${unidadPK}/?_key=ref_unidad`;
        endpoint += '&e=' + ejercicio_select.value;

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
                    this.printPartidas();
                }
                else alert('No fue posible obtener el presupuesto.\n\n' + failure); 
            }
        );
    },
    printPresupuesto(presupuesto)
    {
        if (!presupuesto) presupuesto = this.presupuesto;

        const container = document.querySelector('#presupuesto_container');

        if (presupuesto)
        {
            let template = '';
            Object.keys(this.headerFields).forEach(field => {
                template += `
                    <div class="presupuesto-box-info">
                        <small class="fw-5">${this.headerFields[field]}</small>
                        <p class="m-0">${presupuesto[field]??0}</p>
                    </div>
                `;
            });
            container.innerHTML = template;
        }
        else
        {
            container.innerHTML = `
                <small class="text-secondary w-100">La unidad aún no cuenta con presupuesto</small>
                <button class="btn btn-sm btn-primary py-1 d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#modal_presupuesto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                    Agregar presupuesto
                </button>
            `;
        }
    },
    deletePresupuesto(presupuesto)
    {
        if (!presupuesto) presupuesto = this.presupuesto;
        if (!presupuesto) {
            alert('No hay presupuesto para eliminar');
            return;
        }
        if (!confirm('Está seguro de eliminar el presupuesto de la unidad organizacional seleccionada?')) return;

        let endpoint = editor.services['gop_presupuesto'] + `/${presupuesto.sys_pk}/`;

        main.request(endpoint, 'DELETE', null,
            success => { 
                this.presupuesto = null; 
                this.printPresupuesto();
                this.tablePartidas.DataArray = [];
                this.printPartidas();
            },
            failure => { alert('No fue posible eliminar el presupuesto.\n\n' + failure); }
        );
    },
    savePresupuesto()
    {
        if (!this.presupuesto) {
            alert('No hay presupuesto para guardar');
            return;
        }

        this.presupuesto['partidas'] = this.tablePartidas.DataArray;

        let endpoint = editor.services['gop_presupuesto'] + `/${this.presupuesto.sys_pk}/`;
        console.log(this.presupuesto);
        // main.request(endpoint, 'POST', this.presupuesto,
        //     success => { this.presupuesto = success; },
        //     failure => { alert('No fue posible actualizar el presupuesto.\n\n' + failure); }
        // );
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
            isDirty = (JSON.stringify(this.tablePartidas.DataArray) !== JSON.stringify(this.partidasBackup));
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
    discardPresupuesto()
    {
        if (!confirm('¿Está seguro de descartar todos los cambios del presupuesto realizados en la tabla de partidas?'))
            return;

        if (this.partidasBackup)
        {
            this.tablePartidas.DataArray = this.partidasBackup;
            this.printPartidas();
        }
        this.showDirtyControls(false);
    },
    load_presupuesto_modal()
    {
        let presupuesto = (this.presupuesto ?? {});
        main.setValues('modal_presupuesto', presupuesto);
    },

    // =============== PARTIDAS
    getPartidas(presupuestoPK)
    {
        let endpoint = editor.services['gop_partida'] + `/?presupuesto=${presupuestoPK}`;
        main.request(endpoint, 'GET', null,
            success => { 
                this.tablePartidas.DataArray = success;
                this.partidasBackup = JSON.parse(JSON.stringify(success));
                this.printPartidas(); 
            },
            failure => { 
                alert('No fue posible obtener las partidas.\n\n' + failure); 
                this.tablePartidas.DataArray = [];
                this.partidasBackup = [];
                this.printPartidas();
            }
        );
    },
    printPartidas()
    {
        this.tablePartidas._printRows();

        const partidas_main_container = document.querySelector('#partidas_main_container');
        partidas_main_container.classList.toggle('d-none', (this.presupuesto ? false : true));
    },
    addRowPartida()
    {
        this.tablePartidas.AddRow();
    },
    insertRowPartida()
    {
        console.log('insertar');
    },
    deleteRowPartida()
    {
        this.tablePartidas.DeleteCurrentRow();
    },
}

document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});
