var presupuesto = 
{
    table: null,
    sumFields: [],
    excludeAnualFields: [],
    events: null,
    onCalculeBranch: null,

    init()
    {
        // this.table = document.querySelector('#tablaPresupuestos');
        // this.sumFields = ['autorizado','anual','reserva','enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
        // this.excludeAnualFields = ['anual','autorizado'];
        // this.events = this.table.EdiTable.Const.Events;
        // this.setTableEvents();
    },
    setTableEvents()
    {
        // Antes de mover la fila
        this.table.Events[this.events.BeforeMoveRow] = (e) =>
        {
            /**
             * Antes de mover preguntamos si desea continuar y recalcular la fila destino en base a la 
             * fila origen cuando ésta se pretende agregar como hija de una fila que también es hija.
             */
            const options = this.table._getTreeOptions();
            
            if (e.child && e.target[options.parentkey]) {
                e.cancel = !confirm('Si continua se recalculará la fila superior (fila destino) a partir de la fila que pretende agregar como hija (fila origen).');
            }
        };

        // Depués de mover la fila
        this.table.Events[this.events.RowMoved] = (e) =>
        {
            /**
             * Recalculamos la rama desde el padre del nodo origen y nodo destino hacia arriba
             * Nota: en ésta instancia DataArray es un array multi-nivel, depués de terminar con la 
             * función RowMoved regresa a su estado normal (array de un nivel).
             */
            let sparent = this.getParentNode(e.source, this.table.DataArray);
            this.recalculeBranch(sparent, this.table.DataArray);
            if (e.child)
            {
                this.recalculeBranch(e.target, this.table.DataArray);
            }
            else
            {
                let tparent = this.getParentNode(e.target, this.table.DataArray);
                this.recalculeBranch(tparent, this.table.DataArray);
            }
            if (this.onCalculeBranch) this.onCalculeBranch(this.table.DataArray);
        }

        // Antes de actualizar una celda
        this.table.Events[this.events.BeforeUpdateCell] = (e) =>
        {
            /**
             * Si se va a actualizar una celda sumable y la fila de la celda a editar tiene hijos se cancela
             */
            const isSumable = this.sumFields.includes(e.coldef.field);
            if (isSumable)
            {
                let obj=e.sender.DataArray[e.sender.RowIndexOfTd(e.td)];
                if (obj)
                {
                    const options = this.table._getTreeOptions();
                    const hasChilds = e.sender.DataArray.find(data => (obj[options.key]??'___') == data[options.parentkey]);
                    if (hasChilds) {
                        e.cancel = true;
                    }
                }
            }
        }

        // Después de modificar el valor de una cela
        this.table.Events[this.events.FieldUpdated] = (e) =>
        {
            /**
             * Si se modificó una celda que es sumable actualizamos el campo Anual y recalculamos la  
             * rama a partir del nodo modificado
             */
            const sumable = this.sumFields.find(field => field == e.field);
            
            if (sumable)
            {
                let obj = this.table.DataArray[e.row];

                if (obj)
                {
                    this.calculeAnualFromDataRow(obj);
                    this.table.GetTree();
                    let parent = this.getParentNode(obj, this.table.DataArray);
                    if (parent) this.recalculeBranch(parent, this.table.DataArray);
                    if (this.onCalculeBranch) this.onCalculeBranch(this.table.DataArray);
                    this.table.SetTree(this.table.DataArray);

                    this.table._refreshTable();

                    // Validamos el valance con su nuevo valor
                    this.valideAuthBalance();
                }
            }
        }

        // Después de agregar una nueva fila
        this.table.Events[this.events.RowAdded] = (e) =>
        {
            /**
             * Primero agregamos un identificador si no lo tiene para el correcto funcionamiento
             * de las funciones de arbol (agregar hijos, mover de posición, etc), después llamamos a la
             * función personalizada onCalculeBranch para indicar un nuevo cambio en el DataArray 
             */
            
            let data = this.table.DataArray[e.rowIndex];
            if (data) this.table._resolveKey(data);

            this.table.GetTree();
            if (this.onCalculeBranch) this.onCalculeBranch(this.table.DataArray);
            this.table.SetTree(this.table.DataArray);
        };

        // Después de eliminar una fila
        this.table.Events[this.events.RowDeleted] = (e) =>
        {
            /**
             * Recalculamos la rama de la fila superior a partir del índice de la fila eliminada
             */

            let obj = this.table.DataArray[e.row];
            this.table.GetTree();

            if (obj)
            {
                let parent = this.getParentNode(obj, this.table.DataArray);
                if (parent) this.recalculeBranch(parent, this.table.DataArray);
            }
            
            if (this.onCalculeBranch) this.onCalculeBranch(this.table.DataArray);
            this.table.SetTree(this.table.DataArray);
        };

        // Definir la función que obtiene los Tds para validar el saldo autorizado
        this.table.onTdPaint = (td, row, col, field) => 
        {
            if (field == 'autorizado')
            {
                let obj = this.table.DataArray[row];
                this.alertAuthBalance(td, obj);
            }
        }

        this.valideAuthBalance();
    },
    calculeAnualFromDataRow(data)
    {
        let anual = 0;

        Object.keys(data).forEach(key => {
            if (!this.excludeAnualFields.find(f => f == key) && this.sumFields.find(f => f == key)) 
                anual = Math.add(anual, Number(data[key]??0));
        });

        data['anual'] = Number(anual);
    },
    getCellIndexByField(field='')
    {
        let index = -1;
        this.table.Columns.forEach((col, i) => {
            if ((col.field??'_') == field) index = i;
        });
        return index;
    },
    getCellFromRow(cellindex, row)
    {
        let cell = null;
        if (row) row.querySelectorAll('td').forEach((td,i) => {
            if (i == cellindex) cell = td;
        });
        return cell;
    },
    getParentNode(node, dataArray=[])
    {
        const opts = this.table._getTreeOptions();
        let parent = null;

        const search = (l=[]) => {
            return l.some(n => {
                if (node[opts.parentkey] == (n[opts.key] ?? '_')) parent = n;
                return (parent || search((n[opts.childs]??[])));
            });
        }
        search(dataArray);
        return parent;
    },
    recalculeBranch(node, dataArray=[])
    {
        const opts = this.table._getTreeOptions();

        const calcule = (node={}, childs=[]) => 
        {
            // Inicializamos en 0 los valores del nodo
            this.sumFields.forEach(field => { if (node[field] != undefined) node[field] = 0 });

            // Recorremos sus hijos para la sumatoria
            childs.forEach(child => 
            {
                this.sumFields.forEach(field => {
                    if (node[field] != undefined)
                        node[field] = Math.add(Number(node[field]), Number((child[field]??0)));
                });
            });

            // Realizamos la misma operación con su padre
            let parent = this.getParentNode(node, dataArray);
            if (parent) calcule(parent, (parent[opts.childs]??[]));
        }
        
        if (node)
        {
            calcule(node, (node[opts.childs]??[]));
        }
    },
    alertAuthBalance(td, data)
    {
        if (td && data)
        {
            const autorizado = Number(data['autorizado']??0);
            const anual = Number(data['anual']??0);
            const exceeded = (anual > autorizado);
            
            td.style.backgroundColor = (exceeded ? '#E53E30' : 'inherit');
            td.style.color = (exceeded ? '#FFF' : 'inherit');
        }
    },
    valideAuthBalance()
    {
        const authIndex = this.getCellIndexByField('autorizado');
        this.table._table.querySelectorAll('tbody tr').forEach((tr,i) => {
            const td = this.getCellFromRow(authIndex, tr);
            let obj = this.table.DataArray[i];
            if (td && obj) this.alertAuthBalance(td, obj);
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    presupuesto.init();
});