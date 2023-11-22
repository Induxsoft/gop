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
        monto_ejercido:'Ejercido:' 
    },

    init()
    {
        this.tableUnidades = document.querySelector('#treeUnidades');
        this.tablePartidas = document.querySelector('#treePartidas');
        this.setConfigTables();
        this.setEventTables();
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
            this.tableUnidades.Events[this.tableUnidades.EdiTable.Const.Events.EnterCell] = (e) =>
            {
                this.unidadSelected = this.tableUnidades.DataArray[e.sender.CurrentRowIndex()];
                this.getPresupuesto(this.unidadSelected.sys_pk);
            };
        }
        if (this.tablePartidas)
        {
            if (presupuesto)
            {
                presupuesto.table = this.tablePartidas;
                presupuesto.sumFields = ['autorizado','reserva','p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11','p12',
                    'rc','c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12',
                    're','e01','e02','e03','e04','e05','e06','e07','e08','e09','e10','e11','e12'];
                presupuesto.events = this.tablePartidas.EdiTable.Const.Events;
                presupuesto.setTableEvents();
            }
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
        let endpoint = editor.services['gop_presupuesto'] + `/${unidadPK}/?_key=ref_unidad`;

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
            container.innerHTML = '<small class="text-secondary">No hay presupuesto.</small>';
            this.printPartidas({});
        }
    },
    deletePresupuesto(presupuesto)
    {
        if (!presupuesto) presupuesto = this.presupuesto;
        let endpoint = editor.services['gop_presupuesto'] + `/${presupuesto.sys_pk}/`;

        if (!presupuesto) return;

        main.request(endpoint, 'DELETE', null,
            success => { this.presupuesto = null; this.printPresupuesto(null); },
            failure => { alert('No fue posible eliminar el presupuesto.\n\n' + failure); }
        );
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});
