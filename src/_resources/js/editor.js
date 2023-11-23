var editor = 
{
    tableUnidades: null, 
    tablePartidas: null,
    unidades: [], 
    unidadSelected:null, 
    presupuesto:null, 
    partidas:null,
    headerFields: { 
        titulo:'Título:', 
        status:'Estado:', 
        divisa:'Moneda', 
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
        if (ejercicio_select) ejercicio_select.addEventListener('change', e => { this.getPresupuesto(this.unidadSelected?.sys_pk??null) });
    },
    setConfigTables()
    {
        if (this.tableUnidades)
        {
            this.tableUnidades.AutoAddRow = false;
            this.tableUnidades.AutoDelRow = false;
            this.tableUnidades.EverMove = false;
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
        if (this.tablePartidas)
        {
            if (presupuesto)
            {
                presupuesto.table = this.tablePartidas;
                presupuesto.sumFields = ['autorizado','reserva','anual','p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11','p12'];
                presupuesto.excludeAnualFields = ['autorizado', 'reserva', 'anual'];
                presupuesto.events = this.tablePartidas.EdiTable.Const.Events;
                presupuesto.setTableEvents();
            }
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
        console.log(row);
        if (row) this.tablePartidas.RowIndent(row, add);
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
    addPresupuesto()
    {
        let values = main.getValues('mdl_ap_controls');

        if (!this.unidadSelected) {
            alert('Debe seleccionar una unidad organizacional para continuar.');
            return;
        }

        const ejercicio_select = document.querySelector('#ejercicio_select');

        values['ref_unidad'] = this.unidadSelected.sys_pk;
        values['ejercicio'] = Number(ejercicio_select.value);

        let endpoint = editor.services['gop_presupuesto'];
        endpoint += '/_new';

        main.request(endpoint, 'POST', values,
            success => { 
                this.presupuesto = success;
                this.printPresupuesto(this.presupuesto);
                this.getPartidas(this.presupuesto.sys_pk);
                main.clearValues('mdl_ap_controls'); 
                main.closeModal('modal_add_presupuesto');
            },
            failure => { alert('No fue posible agregar la unidad.\n\n' + failure); }
        );
    },
    getPresupuesto(unidadPK)
    {
        if (!unidadPK) return;

        let endpoint = editor.services['gop_presupuesto'] + `/${unidadPK}/?_key=ref_unidad`;
        endpoint += '&e=' + ejercicio_select.value;

        main.request(endpoint, 'GET', null,
            success => { this.presupuesto = success; this.printPresupuesto(); },
            failure => {
                if (failure?.message?.includes('Elemento no encontrado')) {
                    this.presupuesto = null;
                    this.printPresupuesto();
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
            this.getPartidas();
        }
        else
        {
            container.innerHTML = `
                <small class="text-secondary w-100">La unidad aún no cuenta con presupuesto</small>
                <button class="btn btn-sm btn-white py-1 d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#modal_add_presupuesto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                    </svg>
                    Agregar un presupuesto
                </button>
            `;
            this.printPartidas({});
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
            success => { this.presupuesto = null; this.printPresupuesto(null); },
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

    // =============== PARTIDAS

    getPartidas(presupuestoPK)
    {
        let endpoint = editor.services['gop_partida'] + `/?presupuesto=${presupuestoPK}`;
        main.request(endpoint, 'GET', null,
            success => { this.partidas = success; this.printPartidas(); },
            failure => { alert('No fue posible obtener las partidas.\n\n' + failure); this.printPartidas({}) }
        );
    },
    printPartidas(partidas)
    {
        if (!partidas) partidas = this.partidas;
        console.log('Partidas:');
        console.log(partidas);
    },
    deletePartidaRow()
    {
        this.tablePartidas.DeleteCurrentRow();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});
