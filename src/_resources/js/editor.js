var editor = 
{
    tableUnidades: null, unidades: [], unidadSelected:null,

    init()
    {
        this.tableUnidades = document.querySelector('#treeUnidades');
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
            };
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
                console.log(success);
                this.getUnidades(); 
                main.clearValues(); 
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
            success => { console.log(success); this.getUnidades(); },
            failure => { alert('No fue posible eliminar la unidad.\n\n' + failure); }
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});
