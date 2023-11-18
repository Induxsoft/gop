class EditTable extends HTMLElement
{
    attributes = null;
    _table = null;
    _shadow = null;
    _current = null;
    _temp_dt = null;
    
    constructor() 
    {
        super();
        document.addEventListener('DOMContentLoaded', () => this.attributes = this.getAttributeNames());
    }

    static get observedAttributes()
    {
        return this.attributes;
    }

    attributeChangeCallback(property, oldValue, newValue)
    {
        if (newValue === oldValue) return;
        this[property] = newValue;
    }

    connectedCallback()
    {
        document.addEventListener('DOMContentLoaded', () => 
        {
            this._shadow = this.attachShadow({ mode: 'closed' });
            
            this._shadow.innerHTML = `
                <style>
                    .EdiTable-Selector{
                        width: 100%;
                        height: 100%;
                        text-align: left;
                        background-color: rgba(255,255,255,.7);
                        cursor: text;
                        border: 1px solid #FFF;
                        border-radius: 3px;
                        outline: none;
                        padding: 3px;
                    }
                    .EdiTable-Input-Check{
                        height: 100%;
                    }
                    .EdiTable-Cell
                    {
                        height: 1.4rem;
                        padding: 4px;
                        outline: 1px solid #EDEDED;
                        position: relative;
                    }
                    .EdiTable-Row-Selected
                    {
                        background-color: #3D75DD !important;
                        color: #FFF !important;
                    }
                    
                    table{ width: 100%; font-size: 1rem; border-spacing: 1px; }
                    tbody tr {
                        position: relative;
                    }
                    tbody tr:hover {
                        background-color: #F5F5F5;
                    }
                    thead {
                        background-color: #F5F5F5;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }
                    thead tr th{
                        padding: 4px 8px;
                        outline: 1px solid #DDD;
                        font-weight: normal;
                        position: relative;
                        cursor: pointer;
                    }
                    .Editable-Input-Number,
                    .Editable-Input-Text, 
                    .Editable-Input-Memo, 
                    .Editable-Input-Date, 
                    .Editable-Input-DateTime,
                    .Editable-Input-Select {
                        position: absolute;
                        top: 0;
                        left: 0;
                        box-sizing: border-box;
                        height: 100%;
                        border: none; outline:1px solid #ced4da;display: block;width: 100%;padding: 0.375rem 0.75rem;font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-clip: padding-box;appearance: none;transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .Editable-Input-Select{
                        display: block;width: 100%;padding: 0.375rem 2.25rem 0.375rem 0.75rem;-moz-padding-start: calc(0.75rem - 3px);font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");background-repeat: no-repeat;background-position: right 0.75rem center;background-size: 16px 12px;border: none;outline:1px solid #ced4da;-webkit-appearance: none;-moz-appearance: none;appearance: none;
                    }
                    .EdiTable-Button{
                        padding: 2px;
                        background-color: transparent;
                        color: #3D75DD;
                        border: 0;
                        cursor: pointer;
                        position: absolute;
                        right: 6px;
                        top: 2px;
                        bottom: 0;
                    }
                    .haschild td:first-of-type {
                        padding-left: 2rem;
                    }
                    .haschild td:first-of-type::before {
                        content:' \\23F5';
                    }
                    .haschild td:first-of-type::before:hover {
                        background-color: red;
                    }
                    .sizable-border {
                        position: absolute; 
                        top: 0; 
                        right: 0; 
                        width: 5px; 
                        cursor: col-resize;
                        background-color: transparent;
                    }

                    .tr-border-bottom td{ 
                        transition: border .1s; 
                        border-bottom: 6px solid #888; 
                        outline: 0;
                    }
                    
                    .icon-child div::before{ 
                        content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='%23555' class='bi bi-indent' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M3 8a.5.5 0 0 1 .5-.5h6.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H3.5A.5.5 0 0 1 3 8Z'/%3E%3Cpath fill-rule='evenodd' d='M12.5 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5Z'/%3E%3C/svg%3E");
                        /* content: 'Children';
                        font-size: .8rem;
                        font-weight: 500;
                        color: #888; */
                        background-color: inherit !important;
                        z-index:1000000; 
                        position: absolute; 
                        left: 2px;
                        top: 4px;
                        bottom: 0;
                        padding: 2px 4px 0 4px;
                        display:flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .bg-child {
                        background-color: #F5F5F5 !important;
                        color: #000 !important;
                    }
                    .dragging{ background-color: #EDEDED !important; color: #000 !important; border: 0 !important; outline: 0 !important; }
                    .cell-collapsable {  }
                    .collapse-btn { cursor: pointer; }
                    .cell-content { width: 100%; height: 100%; display: flex; align-items: center; }
                    .hidde-row{ display: none; }
                    .container-cell-content { display: flex; gap:2px; width:-webkit-fill-available; height: 100%; align-items: center;}

                    .induxsoft-form-control{border: none; outline:1px solid #ced4da;display: block;width: 100%;padding: 0.375rem 0.75rem !important;font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-clip: padding-box;appearance: none;transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .induxsoft-form-control:disabled, .induxsoft-form-control[readonly] {background-color: #e9ecef;opacity: 1;
                    }
                    .induxsoft-buttons{display: inline-block;font-weight: 400;line-height: 1.5;color: #212529;text-align: center;text-decoration: none;vertical-align: middle;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;user-select: none;background-color: #FFF;outline:1px solid #ced4da;border: none;padding: 0.375rem 0.75rem;font-size: 1rem;transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .induxsoft-buttons:hover{color: #212529;background-color: #F5F5F5;
                    }
                    .induxsoft-form-select {display: block;width: 100%;padding: 0.375rem 2.25rem 0.375rem 0.75rem !important;-moz-padding-start: calc(0.75rem - 3px);font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");background-repeat: no-repeat;background-position: right 0.75rem center;background-size: 16px 12px;border: none;outline:1px solid #ced4da;-webkit-appearance: none;-moz-appearance: none;appearance: none;
                    }

                    ` + (this.getAttribute('control-styles') ?? '') + `
                </style>
            `;

            if (this.hasAttribute('data') && this.getAttribute('data').trim() != "")
            {
                try{ this.DataArray = JSON.parse(this.getAttribute('data')); }
                catch{ alert('El valor del atributo "data" tiene un formato JSON inválido'); this.DataArray = []; }
            }

            const container1 = this._createFullElement('div', { style:'min-height: 2rem; max-height: 100%; overflow: auto; padding-bottom: 5px' });
            this._table = this._getFullTable();
            container1.appendChild(this._table);
            this.innerHTML = '';
            this._shadow.appendChild(container1);
            
            this._initTreeValues();

            if (this.ShowAsTree)
                this._printTreeData();

            this.Initialize(this._table.getAttribute('id'));
            this._processAtributesColumn();
            this._resizableGrid(this._table);
            this._setSortEvent();
        });
    }

    _getFullTable=()=>
    {
        const table = this._createFullElement('table', { id:(this.getAttribute('id')??'f077fb41716141eeb7ecb1ed0a1ce292') });
        const thead = (this._replaceTagNameElement(this.querySelector('edit-thead'), 'thead') ?? this._createFullElement('thead'));
        const tbody = (this._replaceTagNameElement(this.querySelector('edit-tbody'), 'tbody') ?? this._createFullElement('tbody'));

        if (thead.hasChildNodes())
        {
            thead.querySelectorAll('*').forEach(e => { if (e.tagName.toLocaleLowerCase() != 'edit-tr' && e.tagName.toLocaleLowerCase() != 'edit-th') e.remove(); });

            thead.querySelectorAll('edit-tr').forEach(editTr => editTr.replaceWith(this._replaceTagNameElement(editTr, 'tr')));
            thead.querySelectorAll('tr').forEach(tr => {
                tr.querySelectorAll('edit-th').forEach(editTh => editTh.replaceWith(this._replaceTagNameElement(editTh, 'th')));
            });
        }

        if (tbody.hasChildNodes())
        {
            tbody.querySelectorAll('*').forEach(e => { if (e.tagName.toLocaleLowerCase() != 'edit-tr' && e.tagName.toLocaleLowerCase() != 'edit-td') e.remove(); });
            
            tbody.querySelectorAll('edit-tr').forEach(editTr => editTr.replaceWith(this._replaceTagNameElement(editTr, 'tr')));
            tbody.querySelectorAll('tr').forEach(tr => {
                tr.querySelectorAll('edit-td').forEach(editTd => {
                    editTd.classList.add('EdiTable-Cell');
                    editTd.replaceWith(this._replaceTagNameElement(editTd, 'td'))
                });
            });
        }

        if (this.DataArray && this.DataArray.length > 0 && thead.hasChildNodes() && !tbody.hasChildNodes())
        {
            this.DataArray.forEach((data, idx) => {
                const tr = this._createFullElement('tr');
                thead.querySelectorAll('th').forEach(th => {
                    let coldef = this._getColdefByTh(th);
                    const td = this._createFullElement('td', { class:'EdiTable-Cell' });
                    Object.keys(data).forEach(key => {
                        if (td.textContent == '' && (th.getAttribute('field') == key || th.getAttribute('keyfield') == key)){
                            let value = data[key];
                            if (this._withFormat(coldef, value))
                                value = this._aplyFormat(coldef, value);
                            td.textContent = value;
                        }
                    });
                    tr.appendChild(td);
                    td.style.textAlign = (coldef?.textalign??'');
                    if (this.onTdPaint) this.onTdPaint(td, idx, this.ColIndexOfTd(td), (coldef?.field??''));
                });
                tbody.appendChild(tr);
            });  
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        return table;
    }
    _getColdefByTh=(th)=>
    {
        let def = {};
        if (th && th.hasAttributes())
            th.getAttributeNames().forEach(attrName => def[attrName] = th.getAttribute(attrName));
        return def
    }
    _replaceTagNameElement=(element, tagName)=>
    {
        if (!element) return null;

        let attributes = {};

        if (element.hasAttributes())
            element.getAttributeNames().forEach(attrName => attributes[attrName] = element.getAttribute(attrName));

        const newElement = this._createFullElement(tagName, attributes);
        newElement.innerHTML = element.innerHTML;

        return newElement;
    }
    _createFullElement=(tagName="div", attributes={})=>
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    _processAtributesColumn=()=>
    {
        let listColumns = this._shadow.querySelectorAll('th');
        if (listColumns && listColumns.length > 0)
        {
            listColumns.forEach((column, i) => {
                let attributes = column.getAttributeNames();
                let settings = {};
                if (attributes && attributes.length > 0){
                    attributes.forEach(attr => {
                        settings[attr] = this._getAttributeColumn(attr, column.getAttribute(attr));
                    });
                }
                this.Columns[i] = settings;
            });
        }
    }
    _getAttributeColumn=(attr, value)=>
    {
        switch (attr)
        {
            case 'type':
            {
                value = eval('this.EdiTable.Const.Columns.Types.' + value);
                break;
            }
            case 'options':
            {
                value = JSON.parse(value);
                break;   
            }
        }
        return value;
    }
    _resizableGrid=(table)=>
    {
        const rows = table.querySelectorAll('tr');
        if (!rows || rows.length < 1) return;
        
        const cols = rows[0].querySelectorAll('th');
        if (!cols || cols.length < 1) return;
        
        cols.forEach(col => {
            const sizableBorder = this._createFullElement('div', { class:'sizable-border', style:`height:${table.offsetHeight}px;` });
            this._addSizableFunction(sizableBorder);
            col.appendChild(sizableBorder);
        });
    }
    _addSizableFunction=(element)=>
    {
        var pageX,curCol,nxtCol,curColWidth,nxtColWidth;

        element.onclick = (e) => { e.stopPropagation(); }

        element.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            curCol = e.target.parentElement;
            nxtCol = curCol.nextElementSibling;
            pageX = e.pageX;
            curColWidth = curCol.offsetWidth
            if (nxtCol)
                nxtColWidth = nxtCol.offsetWidth
        });
        document.addEventListener('mousemove', (e) => {
            e.stopPropagation();
            if (curCol) {
                var diffX = e.pageX - pageX;
                if (nxtCol)
                    nxtCol.style.width = (nxtColWidth - (diffX))+'px';
                curCol.style.width = (curColWidth + diffX)+'px';
            }
        });
        document.addEventListener('mouseup', (e) => { 
            e.stopPropagation();
            curCol,nxtCol = undefined;
            nxtCol = undefined;
            pageX = undefined;
            nxtColWidth = undefined;
            curColWidth = undefined;
        });    
    }
    _getRowIndex=(tr)=>
    {
        let index = -1;
        let tbody = tr?.parentElement;
        if (tbody) tbody.querySelectorAll('tr').forEach((_tr, i) => { if (_tr === tr) index = i });
        return index;
    }
    _getVisibleRowIndex=(tr)=>
    {
        let index = -1;
        let tbody = tr?.parentElement;
        if (tbody) tbody.querySelectorAll('tr:not(.hidde-row)').forEach((_tr, i) => { if (_tr === tr) index = i });
        return index;
    }
    _getCurren=(setnew=false)=>
    {
        if (!this._current || setnew)
            this._current = Object.assign({}, this);
        return this._current;
    }
    _setSortEvent=()=>
    {
        const fields = this._table.querySelectorAll('th');
        fields.forEach(field => {
            let par = 0;
            field.onclick = e => {
                e.stopPropagation();
                par++;
                if (this.ShowAsTree)
                {
                    let options = this._getTreeOptions();
                    this.GetTree(options);
                    this.SortTree(this.DataArray, (field.getAttribute('field')??''), (par%2==0), options);
                    this.SetTree(this.DataArray, options);
                }
                else
                {
                    this.Sort(this.DataArray, (field.getAttribute('field')??''), (par%2==0));
                }
                this._printRows();
            };
        });
    }
    _moveData(sourceData, targetData, moveAsChild=false, treeOptions=null)
    {
        let success = false;

        var eventArgs = {
            source: sourceData,
            target: targetData,
            child: moveAsChild,
            sender:this._getCurren(),
            cancel:false
        };

        if (this.Events[this.EdiTable.Const.Events.BeforeMoveRow]!=undefined)
            this.Events[this.EdiTable.Const.Events.BeforeMoveRow](eventArgs);

        if (eventArgs.cancel)
            return success;

        if (!treeOptions) treeOptions = this._getTreeOptions();
        if ((sourceData[treeOptions.key]??'_') === (targetData[treeOptions.key]??'|')) return success;

        let source = null;
        let target = null;
        let isChil = false;

        const search = l => 
        {
            return l.some((obj, idx) => 
            {
                if (sourceData[treeOptions.key] == (obj[treeOptions.key]??'_')) 
                    source = { obj, l, idx };
                else if (targetData[treeOptions.key] == (obj[treeOptions.key] ?? '_')) 
                    target = { obj, l, idx };
                return ((source && target) || search((obj[treeOptions.childs]??[])));
            });
        }

        const targetChild = l => 
        {
            return l.some(obj => 
            {
                if (targetData[treeOptions.key] == (obj[treeOptions.key] ?? '_')){
                    isChil = true;
                    console.log('Can not add a parent row like child row');
                }
                return (isChil || targetChild((obj[treeOptions.childs]??[])));
            });
        }
        
        try
        {
            this.GetTree(treeOptions);

            if(search(this.DataArray) && !targetChild((source?.obj[treeOptions.childs]??[])))
            {
                let sameLevel = (source.l == target.l);
                let notaddidx = (sameLevel && source.idx <= target.idx);
                
                if (!moveAsChild)
                {
                    let data = source.l.splice(source.idx, 1)[0];
                    data[treeOptions.parentkey] = target.obj[treeOptions.parentkey];
                    target.l.splice(target.idx + (notaddidx ? 0 : 1), 0, data);
                }
                else
                {
                    const parentChilds = (target.obj[treeOptions.childs]??[]);
                    let data = source.l.splice(source.idx, 1)[0];
                    data[treeOptions.parentkey] = target.obj[treeOptions.key]
                    parentChilds.unshift(data);
                    target.obj[treeOptions.childs] = parentChilds;
                }
                success = true;
            }
        }
        catch(error)
        {
            console.log(error);
            success = false
        }
        finally 
        {
            if (success && this.Events[this.EdiTable.Const.Events.RowMoved]!=undefined)
                this.Events[this.EdiTable.Const.Events.RowMoved](eventArgs);

            this.SetTree(this.DataArray, treeOptions);
        }

        return success;
    }
    _setMoveEvent=()=>
    {
        let asChild = false;

        const getTr = (e) =>
        {
            let tr = e.currentTarget;
            if (tr.tagName != 'TR') tr = e.target.closest('tr');
            return tr;
        }
        const handleDragStart = (e) => 
        {
            e.stopPropagation();

            let tr = getTr(e);
            tr.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';

            const indexRow = this._getRowIndex(tr);
            const data = (this.DataArray[indexRow] ?? {});
            this._resolveKey(data);
            asChild = false;

            e.dataTransfer.setData('application/json', JSON.stringify(data));
        }
        const handleDragOver = (e) => 
        {
            e.stopPropagation();
            e.preventDefault();
            
            let tr = getTr(e);

            let td = tr.firstChild;
            let cr = td.getBoundingClientRect();
            let lx = (cr.x + (cr.width / 2));

            asChild = (e.clientX > lx);

            tr.classList.add('tr-border-bottom');
            tr.classList.toggle('icon-child', asChild);
            tr.classList.toggle('bg-child', asChild);
        }
        const handleDragEnter = (e) => 
        {
            e.stopPropagation();
            let tr = getTr(e);
            tr.classList.add('tr-border-bottom');
        }
        const handleDragLeave = (e) => 
        {
            e.stopPropagation();
            let tr = getTr(e);
            tr.classList.remove('tr-border-bottom');
            tr.classList.remove('icon-child');
            tr.classList.remove('bg-child');
        }
        const handleDragEnd = (e) => 
        {
            e.stopPropagation();
            let tr = getTr(e);
            tr.classList.remove('dragging');
            tr.classList.remove('tr-border-bottom');
            tr.classList.remove('icon-child');
            tr.classList.remove('bg-child');
        }

        const handleDrop = (e) => 
        {
            e.stopPropagation();
            let tr = getTr(e);
            let sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
            
            tr.classList.remove('dragging');
            tr.classList.remove('tr-border-bottom');
            tr.classList.remove('icon-child');
            tr.classList.remove('bg-child');

            if (sourceData && Object.keys(sourceData).length > 0)
            {
                let targetData = this.DataArray[this._getRowIndex(tr)];
                if (targetData)
                {
                    this._resolveKey(targetData);
                    if (this._moveData(sourceData, targetData, asChild))
                        this._printRows();
                }
            }
            
            return false;
        }

        const trs = this._table.querySelectorAll('tbody tr');

        trs.forEach(tr => 
        {
            tr.setAttribute('draggable', 'true');
            tr.ondragstart =  handleDragStart;
            tr.ondragover =  handleDragOver;
            tr.ondragenter =  handleDragEnter;
            tr.ondragleave =  handleDragLeave;
            tr.ondragend =  handleDragEnd;
            tr.ondrop =  handleDrop;
        });
    }
    _generateUUID=()=>
    {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, 
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    _resolveKey=(data)=>
    {
        let treeOptions = this._getTreeOptions();
        if (data[treeOptions.key] === undefined) data[treeOptions.key] = this._generateUUID();
    }
    _format=(number, decimals=0, thousandSeparator=false)=>
    {
        const roundedNumber = number.toFixed(decimals);
        let integerPart = '', fractionalPart = '';
        
        if (decimals == 0) {
            integerPart = roundedNumber;
            decimalSeparator = '';
        } else {
            let numberParts = roundedNumber.split('.');
            integerPart = numberParts[0];
            fractionalPart = numberParts[1];
        }

        if (thousandSeparator)
            integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${this.NumFormat.thousands}`);

        return `${integerPart}${this.NumFormat.decimals}${fractionalPart}`;
    }

    // ========================= EDITABLE FUNCTIONS
    
    _EdiTable = () => { return {
        Const : {
            HTML:{
                Selector:'<button id="__table_selector" class="EdiTable-Selector"></button>',
                Button:'<button id="__table_button" class="EdiTable-Button"></button>',
                Inputs:{
                    "Text":'<input type="text" id="__table_input" class="Editable-Input-Text"/>',
                    "Number":'<input type="number" id="__table_input" class="Editable-Input-Number"/>',
                    "Date":'<input type="date" id="__table_input" class="Editable-Input-Date"/>',
                    "DateTime":'<input type="datetime-local" id="__table_input" class="Editable-Input-DateTime"/>',
                    "Memo":'<textarea id="__table_input" class="Editable-Input-Memo"></textarea>',
                    "Select":'<select id="__table_input" class="Editable-Input-Select"/>',
                    "Check":'<input type="checkbox" id="__table_input" class="Editable-Input-Check"/>'
                },
                TR:"tr", 
                TD:"td",
                TABLE:"table",
                THEAD:"thead",
                TBODY:"tbody",
                TH:"th"
            },
            Columns:{
                Types:{
                    Text:"Text",
                    Number:"Number",
                    Date:"Date",
                    DateTime:"DateTime",
                    Memo:"Memo",
                    Check:"Check",
                    Select:"Select",
                    Custom:"Custom",
                    NoEditable:"NoEditable"
                }
            },
            Events:{
                EnterCell:"entercell",
                LeaveCell:"leavecell",
                StartEdition:"startedition",
                ConfirmEdition:"confirmedition",
                CancelEdition:"canceledition",
                InputCreated:"inputcreated",
                BeforeUpdateCell:"beforeupdatecell",
                BeforeSetInput:"beforesetinput",
                FieldUpdated:"fieldupdated",
                RowAdded:"rowadded",
                BeforeMoveRow:"beforemoverow",
                RowMoved:"rowmoved"
            },
            SelectorId:"__table_selector",
            InputId:"__table_input",
            ButtonOptionId:"__table_button"
        },
        focusedTable:null,
        Converts:{
            Boolean:{
                ToString:function(value)
                {
                    if (value) return "Sí";
                    return "No";
                },
                FromString:function(value)
                {
                    switch (value.trim().toLowerCase())
                    {
                        case "sí":
                        case "si":
                        case "s":
                        case "y":
                        case "yes":
                        case "ok":
                        case "1":
                        case "t":
                        case "on":
                        case "true":
                        case "cierto":
                            return true;
                    }
    
                    return false;
                }
            }
        },
        GetSelector:function()
        {
            return this._shadow.querySelector("#"+this.EdiTable.Const.SelectorId);
        }.bind(this),
        GetButtonOption:function()
        {
            return this._shadow.querySelector("#"+this.EdiTable.Const.ButtonOptionId);
        }.bind(this),
        GetInput:function()
        {
            var input=this._shadow.querySelector("#"+this.EdiTable.Const.InputId);
            if (!input?.tagName)
                return undefined;
            
            return input;
        }.bind(this),
        GetInputValue:function(input, _current, columnDef)
        {
            var tag=input.tagName;
    
            if (tag==undefined)
            {
                return "";
            }
    
            switch(tag.toLowerCase())
            {
                case "input":
                    switch (input.getAttribute('type').toLowerCase())
                    {
                        case "checkbox":
                            return  columnDef.Converts.ToString(input.checked);
                        default:
                            return input.value;
                    }
                    break;
                case "textarea":
                    return input.value;
                case "select":
                    return input.value;
            }
    
            
        }.bind(this),
        SetInputVal: function (input, text, _current, columnDef)
        {
            switch(input.tagName.toLowerCase())
            {
                case "input":
                {
                    switch (input.getAttribute('type').toLowerCase())
                    {
                        case "checkbox":
                        {
                            input.checked = columnDef.Converts.FromString(text);
                            break;
                        }   
                    }
                    break;
                }
            }

            input.value = text;
        }.bind(this),
        SetSelectorKeyEventHandler:function(selector, _current)
        {
            const funct = (e) => {
                e.preventDefault();
                switch(e.key)
                {
                    case "Home":
                        if (e.ctrlKey)
                            _current.NavToHome();
                        else
                            _current.NavToFirstCell(_current.CurrentRowIndex());
                        break;
                    case "End":
                        if (e.ctrlKey)
                            _current.NavToEnd();
                        else
                            _current.NavToLastCell(_current.CurrentRowIndex());
                        break;
                    case "PageUp":
                        if (_current.CurrentRowIndex()-_current.PagOffSet<0)
                            _current.NavTo(0,_current.CurrentColIndex());
                        else
                            _current.NavTo(_current.CurrentRowIndex()-_current.PagOffSet,_current.CurrentColIndex());
                        break;
                    case "PageDown":
                        if (_current.CurrentRowIndex()+_current.PagOffSet>_current.TRCount()-1)
                            _current.NavTo(_current.TRCount()-1,_current.CurrentColIndex());
                        else
                            _current.NavTo(_current.CurrentRowIndex()+_current.PagOffSet,_current.CurrentColIndex());
                        break;
                    case "Insert":
                        if (_current.AutoDelRow && e.ctrlKey) _current.InsertRow(_current.CurrentRowIndex());
                        break;
                    case "F2":
                        setTimeout(function(){
                            _current.StartEdit(selector.closest('td'),"");
                        },1);
                        break;
                    case "Delete":
                        if (_current.AutoDelRow && e.ctrlKey) _current.DeleteCurrentRow();
                        if (!e.ctrlKey)
                        {
                            setTimeout(function(){
                                _current.StartEdit(selector.closest('td'),"",true);
                            },1);
                        }
                        break;
                    case "ArrowUp":
                        _current.NavUp(selector.closest('td'));
                        break;
                    case "ArrowLeft":
                        _current.NavLeft(selector.closest('td'));
                        break;
                    case "ArrowRight":
                        _current.NavRight(selector.closest('td'));
                        break;
                    case "ArrowDown":
                    _current.NavDown(selector.closest('td'));
                        break;
                    default:
                        if (e.key.trim().length==1)
                        {
                            setTimeout(function(){
                                _current.StartEdit(selector.closest('td'),e.key);
                            },1);
                        }
                        break;
                }
                e.stopPropagation();
            }

            selector.removeEventListener('keydown', funct);
            selector.addEventListener('keydown', funct);
        }.bind(this),
        SetInputStdEventHandler:function(input, _current)
        {
            input.addEventListener("keydown",function(e){
                switch(e.key)
                {
                    case "ArrowUp":
                        _current.NavUp(input.closest('td'));
                        e.stopPropagation();
                        break;
                    case "Escape":
                        _current.CancelEdit(input.closest('td'));
                        e.stopPropagation();
                        break
                    case "Enter":
                        _current.NavRight(input.closest('td'));
                        e.stopPropagation();
                        break;
                    case "ArrowLeft":
                        if (input.selectionStart==0 || input.getAttribute('type').toLowerCase()=="checkbox")
                        {
                            _current.NavLeft(input.closest('td'));
                            e.stopPropagation();
                        }
                        break;
                    case "ArrowRight":
                        if (input.selectionStart==input.value.length || input.getAttribute("type").toLowerCase()=="checkbox")
                        {
                            _current.NavRight(input.closest('td'));
                            e.stopPropagation();
                        }
                        break;
                    case "ArrowDown":
                        _current.NavDown(input.closest('td'));
                        e.stopPropagation();
                        break;
                }
                
            });
        }.bind(this),
        SetInputTextareaEventHandler:function(input, _current)
        {
            input.addEventListener("keydown",function(e){
                switch(e.key)
                {
                    case "Escape":
                        _current.CancelEdit(input.closest('td'));
                        e.stopPropagation();
                        break
                    case "Enter":
                        if (e.ctrlKey)
                        {
                            _current.NavRight(input.closest('td'));
                            e.stopPropagation();
                        }
                        break;
                    case "ArrowLeft":
                        if (input.selectionStart==0)
                        {
                            _current.NavLeft(input.closest('td'));
                            e.stopPropagation();
                        }
                        break;
                    case "ArrowRight":
                        if (input.selectionStart==input.value.length)
                        {
                            _current.NavRight(input.closest('td'));
                            e.stopPropagation();
                        }
                        break;
                }
                
            });
        }.bind(this),
        SetInputSelectEventHandler:function(input, _current)
        {
            input.addEventListener("keydown",function(e){
                switch(e.key)
                {
                    case "Escape":
                        _current.CancelEdit(input.closest('td'));
                        e.stopPropagation();
                        break
                    case "Enter":
                        if (e.ctrlKey)
                        {
                            _current.NavRight(input.closest('td'));
                            e.stopPropagation();
                        }
                        break;
                    case "ArrowLeft":
                        _current.NavLeft(input.closest('td'));
                        e.stopPropagation();
                        break;
                    case "ArrowRight":
                        _current.NavRight(input.closest('td'));
                        e.stopPropagation();
                        break;
                }
                
            });
        }.bind(this),
        SetInputEventHandler:function(input, _current)
        {
            input.addEventListener("click",function(e){
                e.stopPropagation();
            });
    
            switch(input.tagName.toLowerCase())
            {
                case "input":
                    this.EdiTable.SetInputStdEventHandler(input, _current);
                    break;
                case "textarea":
                    this.EdiTable.SetInputTextareaEventHandler(input, _current);
                    break;
                case "select":
                    this.EdiTable.SetInputSelectEventHandler(input, _current);
                    break;
            }
            
        }.bind(this)
    }};

    EdiTable = this._EdiTable();

    // ========================= EDITABLE WC FUNCTIONS

    Events = { };
    TheadRowIndex = 0;
    AutoAddRow = true;
    AutoDelRow = true;
    EverMove = true; //Si es true, deplazamiento a la izquierda en la primera celda sube una fila y se mueve a la última, a la derecha en la última baja una fila y va a la primer celda
    PagOffSet = 10; //Desplazamiento con AvPag PrevPag
    DataArray = []; //Contiene un array asociado a las filas
    ColumnsDefaultType = this.EdiTable.Const.Columns.Types.Text;
    
    ShowAsTree = true;
    TreeOptions = {};
    Key = "id";
    ParentKey = "idp";
    Childs = "__items";
    ButtonOnClick = null;
    onTdPaint = null;
    NumFormat = {
        thousands:",",
        decimals:"."
    }
    
    CSS = {
        Cell:"EdiTable-Cell",
        RowSelected: "EdiTable-Row-Selected"
    };
    Initialize = (tableId) =>
    {
        let tds = this._shadow.querySelectorAll(this.EdiTable.Const.HTML.TABLE+"#"+tableId+" "+this.EdiTable.Const.HTML.TD);
        tds.forEach(td => {
            td.addEventListener('click', (e) => {
                e.stopPropagation();
                this.CellFocus(td);
            });
        });
        this["tableId"]=tableId;
    }
    Columns=[];
    /**
     * 
     * @returns Retorna la referencia al elemento ***thead*** de la tabla.
     */
    GetTHead=()=>
    {
        return this._shadow.querySelector(this.EdiTable.Const.HTML.TABLE+"#"+this.tableId+" "+this.EdiTable.Const.HTML.THEAD);
    }
    /**
     * 
     * @returns Retorna la referencia ***tbody*** de la tabla.
     */
    GetTBody=()=>{
        var tbody= this._shadow.querySelector(this.EdiTable.Const.HTML.TABLE+"#"+this.tableId+" "+this.EdiTable.Const.HTML.TBODY);

        if (!tbody)
        {
            this._shadow.querySelector("#"+this.tableId).innerHTML = "<tbody></tbody>";
            tbody=this._shadow.querySelector(this.EdiTable.Const.HTML.TABLE+"#"+this.tableId+" "+this.EdiTable.Const.HTML.TBODY);
        }

        return tbody;
    }
    /**
     * 
     * @returns Retorna el **número** de columnas de la tabla.
     */
    ColumnsCount=()=>
    {
        var cols=this.THCount();

        if (cols<1)
            if (this.Columns)
                if (this.Columns.length>0)
                    cols=this.Columns.length;
        
        return cols;
    }
    /**
     * Mueve el selector a la primera columna y primera fila de la tabla.
     */
    NavToHome=()=>
    {
        this.NavTo(0,0);
    }
    /**
     * Mueve el selector a la última columna y última fila de la tabla.
     */
    NavToEnd=()=>
    {
        this.NavTo(this.TRCount()-1,this.ColumnsCount()-1);
    }
    /**
     * Mueve el selector a la primer columna de la fila especificada.
     * @param {Number} row Índice de la fila.
     */
    NavToFirstCell=(row)=>
    {
        this.NavTo(row,0);
    }
    /**
     * Mueve el selector a la última columna de la fila especificada.
     * @param {Number} row Índice de la fila.
     */
    NavToLastCell=(row)=>
    {
        this.NavTo(row,this.ColumnsCount()-1);
    }
    /**
     * Mueve el selector a la columna y fila especificada.
     * @param {Number} row Índice de la fila.
     * @param {Number} col Índice de la columna.
     */
    NavTo=(row, col)=>
    {
        let rows=this.TRCount();
        let cols=this.ColumnsCount();

        if (rows<1 || cols<1 || row>rows-1 || col>cols-1 || col<0 || row<0) return;
        
        let tbody=this.GetTBody();
        let td = tbody.querySelectorAll(this.EdiTable.Const.HTML.TR)[row].querySelectorAll(this.EdiTable.Const.HTML.TD)[col];
        this.CellFocus( td );
    }
    /**
     * @param {Number} row Índice de la fila.
     * @returns Retorna la referencia al elemento ***tr*** de la fila especificada.
     */
    GetTrByIndex=(row)=>
    {
        let rows=this.TRCount();
        let cols=this.ColumnsCount();

        if (rows<1 || cols<1 || row>rows-1 || row<0) return undefined;
        
        let tbody=this.GetTBody();

        return tbody.querySelectorAll(this.EdiTable.Const.HTML.TR)[row];
    }
    /**
     * Elimina la fila seleccionada.
     */
    DeleteCurrentRow=()=>
    {
        let col=this.CurrentColIndex();
        let row=this.CurrentRowIndex();

        if (this.DeleteRow(row))
            this.NavTo(row,col);
    }
    /**
     * Elimina la fila especificada.
     * @param {Number} row Índice de la fila a eliminar.
     * @returns Retorna ***true*** si la fila fué eliminada, en caso contrario: ***false***.
     */
    DeleteRow=(row)=>
    {
        let rows=this.TRCount();
        let cols=this.ColumnsCount();

        if (rows<1 || cols<1 || row>rows-1 || row<0) return false;

        this.GetTrByIndex(row).remove();
        this.DataArray.splice(row, 1);
        return true;
    }
    /**
     * Actualiza los valores que se muestran de la fila especificada.
     * @param {Number} row Índice de la fila.
     * @returns Retorna ***true*** si se completó la tarea, en caso contrario: ***false***.
     */
    UpdateRow=(row)=>
    {
        let tr=this.GetTrByIndex(row);

        if (tr==undefined) return false;
        var tds=tr.querySelectorAll(this.EdiTable.Const.HTML.TD);

        if (tds==undefined) return false;

        for(let i=0;i<this.TDCount(tr);i++)
        {
            if (this.Columns[i]!=undefined)
            {
                if (this.Columns[i].field!=undefined)
                    this.SetTdValue(tds[i], (this.DataArray[row][this.Columns[i].field] ?? ''));
                    //tds[i].innerHTML = (this.DataArray[row][this.Columns[i].field] ?? '');
            }
        }

        return true;
    }
    /**
     * Actualiza los objetos del dataArray con los valores todas las filas de la tabla.
     */
    UpdateData=()=>
    {
        for(let i=0;i<this.TRCount();i++)
            this.UpdateDataRow(i);
    }
    /**
     * Actualiza el objeto del dataArray con el valor de la fila especificada.
     * @param {Number} row Índice de la fila.
     * @returns Retorna ***true*** si se completó la tarea, en caso contrario: ***false***.
     */
    UpdateDataRow=(row)=>
    {
        let tr=this.GetTrByIndex(row);

        if (tr==undefined) return false;
        var tds=tr.querySelectorAll(this.EdiTable.Const.HTML.TD);

        if (tds==undefined) return false;

        for(let i=0;i<this.TDCount(tr);i++)
        {
            if (this.Columns[i]!=undefined)
            {
                if (this.Columns[i].field!=undefined)
                {
                    if (tds[i]==this.CurrentTd()[0])
                    {
                        if (!this.Editing)
                        {
                            this.UpdateDataMember(row,this.Columns[i].field,this.EdiTable.GetSelector().innerHTML);
                        }
                    }
                    else
                    {
                        //this.UpdateDataMember(row,this.Columns[i].field,tds[i].innerHTML);
                        this.UpdateDataMember(row,this.Columns[i].field,this.GetTdValue(tds[i]));
                    }
                }
            }
        }

        return true;
    }
    /**
     * 
     * @param {Number} row Índice de la fila.
     * @param {String} field Nombre del campo a actualizar.
     * @param {String} value Valor del campo a actualizar.
     * @param {Boolean} stopfire Detiene la ejecución del evento descendiente *FieldUpdated* del elemento en cuestión.
     * @returns Retorna la información del **objeto** de la fila especificada.
     */
    UpdateDataMember=(row, field, value, stopfire = false)=>
    {
        if (this.DataArray[row]==undefined)
            this.DataArray[row]={};

        if (field!=undefined && value!=undefined)
        {
            this.DataArray[row][field]=value;
            var eventArgs={
                sender:this._getCurren(),
                row:row,
                field:field,
                value:value
            };
            
            if (this._getCurren().Events[this.EdiTable.Const.Events.FieldUpdated]!=undefined && !stopfire)
                this._getCurren().Events[this.EdiTable.Const.Events.FieldUpdated](eventArgs);
        }

        return this.DataArray[row];
    }
    /**
     * Agrega una nueva fila a la tabla.
     */
    AddRow=()=>
    {
        return this.InsertRow();
    }
    /**
     * Crea una nueva fila en el índice especificado.
     * @param {Number} rw índice de la nueva fila.
     * @param {Boolean} nofocus Bloquea la selcción y foco automático al crear la fila.
     */
    InsertRow=(rw, nofocus = false)=>
    {
        var tbody=this.GetTBody();
        var cols=this.ColumnsCount();
        
        if (rw!=undefined)
        {
            this.DataArray.splice(rw,0,{});
        }

        if (cols<1)
            return;

        if (tbody)
        {
            var nr=tbody.insertRow(rw);
            var indexRow=this._getRowIndex(nr);

            for (let i=0;i<cols;i++)
            {
                let cell=nr.insertCell();
                let coldef=this.Columns[i];

                if (this.CSS.Cell)
                    cell.classList.add(this.CSS.Cell);

                    if (coldef!=undefined)
                        if (coldef.default!=undefined)
                        {
                            this.UpdateDataMember(indexRow,coldef.field,coldef.default,true)
                            cell.append(coldef.default);
                        }
            }
            const clickFunct = (e) => {
                e.stopPropagation();
                this.CellFocus(e.target);
            }
            this._shadow.querySelectorAll(this.EdiTable.Const.HTML.TABLE+"#"+this.tableId+" "+this.EdiTable.Const.HTML.TD).forEach(td => {
                td.removeEventListener('click', clickFunct);
                td.addEventListener('click', clickFunct);
            });

            this._setMoveEvent();

            if (!nofocus)
                this.CellFocus(nr.cells[0]);
            
            var eventArgs={
                sender:this._getCurren(),
                tr:nr,
                rowIndex:indexRow,
            };

            if (this._getCurren().Events[this.EdiTable.Const.Events.RowAdded]!=undefined)
                this._getCurren().Events[this.EdiTable.Const.Events.RowAdded](eventArgs);
        }
    }
    /**
     * @returns Retorna el **número** de filas del elemento *tbody* de la tabla.
     */
    TRCount=()=>
    {
        var tbody=this.GetTBody();
        if (tbody)
        {
            let trs=tbody.querySelectorAll(this.EdiTable.Const.HTML.TR);
            if (trs)
                if (trs) return trs.length;
        }

        return 0;
    }
    /**
     * 
     * @returns Retorna el **número** de columnas del elemento *thead* de la tabla.
     */
    THCount=()=>
    {
        var thead=this.GetTHead();
        if (thead)
        {
            let tr=thead.querySelectorAll(this.EdiTable.Const.HTML.TR)[this.TheadRowIndex];

            if (tr)
            {
                let ths=tr.querySelectorAll(this.EdiTable.Const.HTML.TH);
                if (ths) return ths.length;
            }
        }

        return 0;
    }
    /** 
     * @param {HTMLTableRowElement} tr Referencia a una fila *tr* de la tabla.
     * @returns Retorna el **número** de celdas *td* de la fila especificada.
     */
    TDCount=(tr)=>
    {
        if (tr)
        {
            let tds=tr.querySelectorAll(this.EdiTable.Const.HTML.TD);
            if (tds) return tds.length;
        }

        return 0;
    }
    /**
     * @returns Retorna la **celda** *td* actualmente seleccionada.
     */
    CurrentTd=()=>
    {
        if (this.EdiTable.focusedTable!=this._getCurren())
            return null;
        
        var selector=undefined;
        
        if (this.Editing)
        {
            selector=this.EdiTable.GetInput();
            if (selector==undefined)
                selector=this.EdiTable.GetSelector();
        }
        else
        {
            selector=this.EdiTable.GetSelector();
        }

        if (selector==undefined)
            return null;

        if (selector==null)
            return null;

        return selector.closest('td');
        
    }
    /**
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     * @returns Retorna el elemento ***tr*** de la celda especificada.
     */
    TrOfTd=(td)=>
    {
        if (td==undefined)
            return null;

        if (td==null)
            return null;
        
        return td.closest('tr');
    }
    /**
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     * @returns Retorna el **índice** del elemento *tr* de la celda especificada, -1 si la celda es *undefined* o *null*.
     */
    RowIndexOfTd=(td)=>
    {
        if (td==undefined)
            return -1;

        if (td==null)
            return -1;
        
        return this._getRowIndex(td.closest('tr'));
    }
    /**
     * @returns Retorna el **índice** de la fila *tr* de la celda *td* actualmente seleccionada, -1 si no hay niguna celda selccionada.
     */
    CurrentRowIndex=()=>
    {
        let current_td=this.CurrentTd();
        if (current_td==null)
            return -1;
        
        return this._getRowIndex(current_td.closest('tr'));
    }
    /**
     * 
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     * @returns Retorna el **índice** de la celda *td* especificada en relación a su fila *tr*, -1 si la celda es *undefined*, *null*, o no pertenece a una fila *tr*.
     */
    ColIndexOfTd=(td)=>
    {
        if (td==undefined)
            return -1;

        if (td==null)
            return -1;
        
        return td.cellIndex;
    }
    /**
     * @returns Retorna el **índice** de la celda *td* actualmente seleccionada en relación a su fila, -1 si la celda es *null*, o no pertenece a una fila *tr*.
     */
    CurrentColIndex=()=>
    {
        let current_td=this.CurrentTd();

        if (current_td==null)
            return -1;
        
        return current_td.cellIndex;
    }
    /**
     * Ejecuta el evento LeaveCell de la celda especificada.
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     */
    LeaveCell=(td)=>
    {
        if (this._getCurren().Events[this.EdiTable.Const.Events.LeaveCell]==undefined)
        return;

        var eventArgs={
            td:td,
            sender:this._getCurren(),
        };

        this._getCurren().Events[this.EdiTable.Const.Events.LeaveCell](eventArgs);
    }
    /**
     * Ejecuta el evento EnterCell de la celda especificada.
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     */
    EnterCell=(td)=>
    {
        
        if (this._getCurren().Events[this.EdiTable.Const.Events.EnterCell]==undefined)
        return;

        var eventArgs={
            td:td,
            sender:this._getCurren(),
        };

        this._getCurren().Events[this.EdiTable.Const.Events.EnterCell](eventArgs);
    }
    Editing=false;
    /**
     * @returns Retorna información del **objeto** de la columna actualmente seleccionada.
     */
    GetColumnDef=()=>
    {
        let columnDef=this.Columns[this.CurrentColIndex()];
        if (columnDef==undefined)
            columnDef={type:this.ColumnsDefaultType};

        if (columnDef.type==undefined)
                columnDef.type=this.ColumnsDefaultType;

        if (columnDef.type==this.EdiTable.Const.Columns.Types.Check)
        {
            if (columnDef["Converts"]==undefined)
                columnDef["Converts"]=this.EdiTable.Converts.Boolean;
        }
        return columnDef;
    }
    /**
     * @param {Number} td Referencia a un elemento *td* de la tabla.
     * @returns Retorna información del **objeto** de la columna *td* especificada.
     */
    GetColumnDefOfTd=(td)=>
    {
        let columnDef=this.Columns[this.ColIndexOfTd(td)];
        if (columnDef==undefined)
            return null;

        return columnDef;
    }
    /**
     * Se preparan los datos y eventos descendientes al iniciar la edición de un elemento *td*.
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     * @param {String} text Texto que se pasará como parámetro en los eventos descendientes.
     * @param {*} clear Si se establece el valor de *text* será vacio.
     */
    StartEdit=(td,text,clear)=>
    {
        
        let columnDef=this.GetColumnDef();
        
        if (columnDef.type==this.EdiTable.Const.Columns.Types.NoEditable)
            return;

        this.Editing=true;
        
        if (this.Events[this.EdiTable.Const.Events.StartEdition]!=undefined)
        {
            var eventArgs={
                td:td,
                sender:this._getCurren(),
                coldef:columnDef,
                text:text
            };

            this._getCurren().Events[this.EdiTable.Const.Events.StartEdition](eventArgs);
        }

        if (columnDef.type==this.EdiTable.Const.Columns.Types.Custom)
        {
            this.Editing=false;
            return;
        }

        let selector=this.EdiTable.GetSelector();

        this["temp_html"]=selector.innerHTML;

        if (text==undefined)
            text=selector.textContent;

        if (text.trim()==="")
            text=selector.textContent;

        if (clear)
            text="";
        
        selector.style.display = 'none';

        switch(columnDef.type)
        {
            case this.EdiTable.Const.Columns.Types.Memo:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.Memo;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.Memo);
                break;
            case this.EdiTable.Const.Columns.Types.Date:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.Date;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.Date);
                break;
            case this.EdiTable.Const.Columns.Types.DateTime:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.DateTime;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.DateTime);
                break;
            case this.EdiTable.Const.Columns.Types.Select:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.Select;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.Select);
                break;
            case this.EdiTable.Const.Columns.Types.Check:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.Check;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.Check);
                break;
            case this.EdiTable.Const.Columns.Types.Number:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.Number;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.Number);
                break;
            case this.EdiTable.Const.Columns.Types.Text:
                //td.innerHTML = this.EdiTable.Const.HTML.Inputs.Text;
                this.SetTdValue(td, this.EdiTable.Const.HTML.Inputs.Text);
                break;
        }
        let input=this.EdiTable.GetInput();

        if (columnDef.type==this.EdiTable.Const.Columns.Types.Select && columnDef.options!=undefined)
        {
            Object.entries(columnDef.options).forEach(([key, value]) => {
                const option = this._createFullElement('option');
                option.value = key;
                option.textContent = value;
                input.appendChild(option);
            });

            if (columnDef.keyfield!=undefined)
            {
                if (this.DataArray[this.RowIndexOfTd(td)]!=undefined)
                    if (this.DataArray[this.RowIndexOfTd(td)][columnDef.keyfield]!=undefined)
                        text=this.DataArray[this.RowIndexOfTd(td)][columnDef.keyfield];
            }
        }

        var eventArgs={
            input:input,
            td:td,
            sender:this._getCurren(),
            text:text,
            coldef:columnDef
        };

        if (this._getCurren().Events[this.EdiTable.Const.Events.InputCreated]!=undefined)
            this._getCurren().Events[this.EdiTable.Const.Events.InputCreated](eventArgs);

        
        if (this._getCurren().Events[this.EdiTable.Const.Events.BeforeSetInput]!=undefined)
            this._getCurren().Events[this.EdiTable.Const.Events.BeforeSetInput](eventArgs);
        
        this.EdiTable.SetInputVal(input, eventArgs.text, this._getCurren(), columnDef);

        input.focus();
        this.EdiTable.SetInputEventHandler(input,this._getCurren()); 
                                
    }
    /**
     * Actualiza los valores de la columna modificada en el dataArray e inicializa sus eventos descendientes.
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     * @param {String} displayText Texto que se pasará como parámetro en los eventos descendientes.
     * @returns Retorna ***true*** si se culminó la edición, en caso contrario: ***false***.
     */
    ConfirmEdit=(td,displayText)=>
    {
        if (!this.Editing)
            return true;
        
        var columnDef=this.GetColumnDef();

        this.Editing=false;

        let input=this.EdiTable.GetInput();
        var eventArgs={
            input:input,
            text:displayText,
            td:td,
            sender:this._getCurren(),
            coldef:columnDef,
            cancel:false
        };

        if (input!=undefined)
        {
            eventArgs.text=this.EdiTable.GetInputValue(input, this._getCurren(), columnDef);

            if (columnDef.keyfield!=undefined && columnDef.type==this.EdiTable.Const.Columns.Types.Select)
            {
                var combo=input;
                if (combo.selectedIndex<0)
                    eventArgs.text="";
                else
                    eventArgs.text=combo.options[combo.selectedIndex].text;
                    
                this.UpdateDataMember (this.RowIndexOfTd(eventArgs.td),columnDef.keyfield,input.value);
            }

            if (this.Events[this.EdiTable.Const.Events.BeforeUpdateCell]!=undefined)
                this.Events[this.EdiTable.Const.Events.BeforeUpdateCell](eventArgs);

            if (eventArgs.cancel)
            {
                this.Editing=true;
                return false;
            }

            input.remove();
            eventArgs.input=undefined;
        }

        if (this._getCurren().Events[this.EdiTable.Const.Events.ConfirmEdition]!=undefined)
            this._getCurren().Events[this.EdiTable.Const.Events.ConfirmEdition](eventArgs);
        
        if (eventArgs.cancel)
            return false;
        
        //td.innerHTML = eventArgs.text;
        this.SetTdValue(td, eventArgs.text);
        this.UpdateDataMember(this.RowIndexOfTd(td),columnDef.field,eventArgs.text);

        return true;
    }
    /**
     * Cancela la edición de la celda *td* especificada y restablece su valor.
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     */
    CancelEdit=(td)=>
    {
        if (!this.Editing)
            return;

        this.Editing=false;

        let input=this.EdiTable.GetInput();

        if (input!=undefined)
        {
            input.remove();

            if (this["temp_html"]!=undefined && this.EdiTable.focusedTable==this._getCurren())
            {
                //td.innerHTML = this["temp_html"];
                this.SetTdValue(td, this["temp_html"]);
            }

            this.CellFocus(td);
        }

        if (this.Events[this.EdiTable.Const.Events.CancelEdition]!=undefined)
        {
            var eventArgs={
                td:td,
                sender:this._getCurren(),
            };

            this._getCurren().Events[this.EdiTable.Const.Events.CancelEdition](eventArgs);
        }
    }
    /**
     * Establece el foco a la celda *td* especificada.
     * @param {HTMLTableCellElement} td Referencia a un elemento *td* de la tabla.
     */
    CellFocus=(td)=>
    {
        let selector=this.EdiTable.GetSelector();
        let input=this.EdiTable.GetInput();

        if (input!=undefined)
        {
            if (this.EdiTable.focusedTable!=null)
            {
                if (!this.EdiTable.focusedTable.ConfirmEdit(input.closest('td'))) return;
            }
            else
                input.remove();
        }

        if (selector!=undefined)
        {
            //selector.closest('td').innerHTML = selector.innerHTML;
            this.SetTdValue(selector.closest('td'), selector.innerHTML);
            if (this.EdiTable.focusedTable!=null)
            {
                this.LeaveCell(selector.closest('td'));
            }

            selector.remove();
        }

        let txt=this.GetTdValue(td);
        //let txt=td.innerHTML;

        let button = '';
        let coldef = this.GetColumnDefOfTd(td);

        if (coldef && (coldef['button'] ?? '') == 'true') button = this.EdiTable.Const.HTML.Button;
        this.SetTdValue(td,this.EdiTable.Const.HTML.Selector+button);
        //td.innerHTML = this.EdiTable.Const.HTML.Selector;
        
        let btn = this.EdiTable.GetButtonOption();
        
        if (btn)
        {
            btn.innerHTML = ((coldef['buttondata']??'').trim() != '' ?
                coldef['buttondata']:
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>');
            
            if (this.ButtonOnClick)
            {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    let rowIndex = this.RowIndexOfTd(td);
                    let colIndex = this.ColIndexOfTd(td);
                    this.ButtonOnClick(rowIndex, colIndex, coldef);
                }
            }
        }

        selector=this.EdiTable.GetSelector();
        selector.innerHTML = txt;
        this.EdiTable.focusedTable=this._getCurren(true);

        selector.focus();
        this.EnterCell(selector.closest('td'));

        const clickFunc = (e) => {
            e.stopPropagation();
            this.StartEdit(selector.closest('td'),"");  
        }
        selector.removeEventListener('click', clickFunc);
        selector.addEventListener('click', clickFunc);

        this.EdiTable.SetSelectorKeyEventHandler(selector, this._getCurren());
        if (this.CSS.RowSelected)
        {
            let trs = td.closest('tr').parentElement.querySelectorAll('tr');
            if (trs && trs.length > 0) trs.forEach(tr => tr.classList.remove(this.CSS.RowSelected));
            td.closest('tr').classList.add(this.CSS.RowSelected);
        }
    }
    /**
     * Mueve el selector una celda hacia arriba de la celda *td* especificada.
     * @param {HTMLTableCellElement} active_cell Referencia a un elemento *td* de la tabla.
     */
    NavUp=(active_cell)=>
    {
        let active_cell_index=active_cell.cellIndex;
        let parent_tr = active_cell.parentElement;
        let parent_tbody = active_cell.parentElement.parentElement;
        let target_tr = parent_tbody?.querySelectorAll(this.EdiTable.Const.HTML.TR+":not(.hidde-row)")[(this._getVisibleRowIndex(parent_tr) - 1)];
        let target_cell = target_tr?.querySelectorAll(this.EdiTable.Const.HTML.TD)[active_cell_index];
        if( this._getRowIndex(parent_tr) != 0 ) 
            this.CellFocus(target_cell);
    }
    /**
     * Mueve el selector hacia la izquierda de la celda *td* especificada.
     * Si la propiedad *EverMove* está establecida en *true* y el indice de la celda *td* especificada es igual a 0 o es la primera de la fila el selector subirá una fila y se posicionará al final de ésta.
     * @param {HTMLTableCellElement} active_cell Referencia a un elemento *td* de la tabla.
     */
    NavLeft=(active_cell)=>
    {
        let active_cell_index=active_cell.cellIndex;
        if (active_cell_index==0)
        {
            if (!this.EverMove)
                return;
            
            this.NavUp(active_cell);
            this.NavToLastCell(this.CurrentRowIndex());
            return;
        }

        let parent_tr = active_cell.parentElement;
        let target_cell = parent_tr.querySelectorAll(this.EdiTable.Const.HTML.TD)[active_cell_index-1];
        this.CellFocus(target_cell);
    }
    /**
     * Mueve el selector hacia la derecha de la celda *td* especificada.
     * Si la propiedad *EverMove* está establecida en *true* y la celda *td* especificada es la última de la fila el selector bajará una fila y se posicionará al principio de ésta.
     * @param {HTMLTableCellElement} active_cell Referencia a un elemento *td* de la tabla.
     * @returns 
     */
    NavRight=(active_cell)=>
    {
        let active_cell_index=active_cell.cellIndex;

        let parent_tr = active_cell.parentElement;
        
        if (active_cell_index==parent_tr.querySelectorAll('td').length-1)
        {
            if (!this.EverMove)
                return;
            
            this.NavDown(active_cell);
            this.NavToFirstCell(this.CurrentRowIndex());
            return;
        }

        let target_cell = parent_tr.querySelectorAll(this.EdiTable.Const.HTML.TD)[active_cell_index+1];
        this.CellFocus(target_cell);
    }
    /**
     * Mueve el selector una celda hacia abajo de la celda *td* especificada.
     * Si no hay más celdas por bajar y la propiedad *AutoAddRow* está establecida en *true* se agregará una fila nueva hacia abajo de la tabla
     * @param {HTMLTableCellElement} active_cell Referencia a un elemento *td* de la tabla.
     */
    NavDown=(active_cell)=> 
    {
        let active_cell_index=active_cell.cellIndex;
        let parent_tr = active_cell.parentElement;
        let parent_tbody = active_cell.parentElement.parentElement;
        let target_tr = parent_tbody?.querySelectorAll(this.EdiTable.Const.HTML.TR+":not(.hidde-row)")[(this._getVisibleRowIndex(parent_tr) + 1)];
        let target_cell = target_tr?.querySelectorAll(this.EdiTable.Const.HTML.TD)[active_cell_index];
        if( target_tr!=undefined) 
            this.CellFocus(target_cell);
        else
        {
            if (this.AutoAddRow)
                this.AddRow();
        }
    }

    GetTdHtml=(td)=>
    {
        // const cellContent = td.querySelector('div[iscellcontent=true]');
        // if (cellContent)
        //     cellContent.innerHTML = '@value';
        // else
        //     td.innerHTML = '@value';
        return td.innerHTML;
    }
    GetTdValue=(td)=>
    {
        let value = td.innerHTML;
        const cellContent = td.querySelector('div[iscellcontent=true]');
        
        if (cellContent)
            value = cellContent.innerHTML

        let coldef = this.GetColumnDefOfTd(td);
        if (this._withFormat(coldef, value))
            value = value.replace(/[^0-9.]+/g, "");
        
        return value;
    }
    SetTdValue=(td, value)=>
    {
        let coldef = this.GetColumnDefOfTd(td);
        if (this._withFormat(coldef, value))
            value = this._aplyFormat(coldef, value);

        const cellContent = td.querySelector('div[iscellcontent=true]');
        if (cellContent)
        {
            cellContent.innerHTML = value;
            return;
        }

        td.innerHTML = value;
    }
    _withFormat(coldef, value)
    {
        value = value.toString();
        return (value
            && !value.includes('__table_selector') 
            && !value.includes('__table_input') 
            && coldef 
            && coldef.type.toLowerCase() == 'number' 
            && (coldef.format??'') == 'true');
    }
    _aplyFormat(coldef, value)
    {
        let decimals = Number(coldef.decs??0);
        let thousand = ((coldef.thousandssep??'false') == 'true');
        value = this._format(Number(value), decimals, thousand);
        value = `${(coldef.prefix??'')}${value}`;
        value = `${value}${(coldef.sufix??'')}`;
        return value;
    }
    // ========================= SORT FUNCTIONS
    
    _TreeValueIndent = 1;
    _TreeUnitIndent = 'rem';
    _expandOnStart = false;

    _refreshTable=()=>
    {
        let rows = this.TRCount();
        for (let i = 0; i < rows; i++)
            this.UpdateRow(i);
    }
    _initTreeValues=()=>
    {
        let v = (this.getAttribute('show-tree') ?? '').trim();
        this.ShowAsTree = (v == 'true');

        v = (this.getAttribute('key') ?? '').trim();
        this.Key = (v != '' ? v : this.Key);
        
        v = (this.getAttribute('parentkey') ?? '').trim();
        this.ParentKey = (v != '' ? v : this.ParentKey);

        v = (this.getAttribute('childs-field') ?? '').trim();
        this.Childs = (v != '' ? v : this.Childs);
    }
    _getTreeOptions=()=>
    {
        if (!this.TreeOptions || Object.keys(this.TreeOptions) < 1) 
        {
            this.TreeOptions = {
                key: this.Key,
                parentkey: this.ParentKey,
                childs: this.Childs
            }
        }
        return this.TreeOptions;
    }
    _printTreeData=()=>
    {
        if (this.ShowAsTree) this.SetTree(this.GetTree());
        else this.TableArray(this.DataArray);
        this._printRows();
    }
    _printRows=()=>
    {
        const thead = this._table.querySelector('thead');
        const tbody = this._table.querySelector('tbody');

        const trs = tbody.querySelectorAll('tr');
        let rowsExpanded = [];

        trs.forEach(r => {
            if (r.querySelector('span[expanded=true]') && (r.getAttribute('id')??''))
                rowsExpanded.push(r.getAttribute('id'));
        });

        tbody.innerHTML = '';
        let dataArray = this.DataArray;

        if (this.ShowAsTree)
        {
            let treeArray = this.TreeArray(JSON.parse(JSON.stringify(this.DataArray)));
            dataArray = this.TableArray(treeArray, null, false);
        }

        if (dataArray && dataArray.length > 0 && thead.hasChildNodes())
        {
            let treeOptions = this._getTreeOptions();
            
            dataArray.forEach((data, idx) => 
            {
                const tr = this._createFullElement('tr', { id: (data[treeOptions.key]??''), parent: (data[treeOptions.parentkey]??''), indent: (data['__level__']??0) });
                let firstAdded = false;
                let container = null;
                thead.querySelectorAll('th').forEach(th => 
                {
                    let coldef = this._getColdefByTh(th);
                    const td = this._createFullElement('td', { class:'EdiTable-Cell' });

                    if (!firstAdded && this.ShowAsTree)
                    {
                        container = this._createFullElement('div', { class:'container-cell-content' })
                        const content = this._createFullElement('div', { iscellcontent:'true', class:'cell-content' });
                        container.appendChild(content);
                        Object.keys(data).forEach(key => {
                            if (td.textContent == '' && (th.getAttribute('field') == key || th.getAttribute('keyfield') == key)){
                                let value = data[key];
                                if (this._withFormat(coldef, value))
                                    value = this._aplyFormat(coldef, value);
                                    content.innerHTML = value;
                            }
                        });
                        td.appendChild(container);
                        firstAdded = true;
                    }
                    else
                    {
                        Object.keys(data).forEach(key => {
                            if (td.textContent == '' && (th.getAttribute('field') == key || th.getAttribute('keyfield') == key)) {
                                let value = data[key];
                                if (this._withFormat(coldef, value))
                                    value = this._aplyFormat(coldef, value);
                                td.innerHTML = value;
                            }
                        });
                    }
                    tr.appendChild(td);
                    td.style.textAlign = (coldef?.textalign??'');
                    if (this.onTdPaint) this.onTdPaint(td, idx, this.ColIndexOfTd(td), (coldef?.field??''));
                });

                if (this.ShowAsTree)
                {
                    const expand = this._createFullElement('span', { class:'collapse-btn', expanded: this._expandOnStart });
                    expand.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>'
                    
                    const td = tr.firstChild;                    
                    td.classList.add('cell-collapsable');
                    let ident = Number(data['__level__']??0);
                    tr.setAttribute('indent', ident);
                    this._setIndent(td, ident);
                    if(data['__havechilds__'] && container) container.prepend(expand);
                    else this._setIndent(td, ident+.7);

                    expand.onclick = e => {
                        e.stopPropagation();
                        if (expand.getAttribute('expanded') == 'true')
                            this.CollapseRow(tr);
                        else
                            this.ExpandRow(tr);
                    }
                    if (!this._expandOnStart) {
                        expand.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>';
                        if (ident > 0) {
                            tr.classList.add('hidde-row');
                            expand.setAttribute('expanded','false');
                        }
                    }
                }

                tbody.appendChild(tr);
            });  
        }
        rowsExpanded.forEach(trId => {
            const tr = tbody.querySelector(`tr[id='${trId}']`);
            if (tr) this.ExpandRow(tr);
        });
        this.Initialize(this._table.getAttribute('id'));
        if (this.ShowAsTree) this._setMoveEvent();
    }

    _setIndent=(td, indent=0)=>
    {
        if (!td) return;
        td.style.paddingLeft = `${this._TreeValueIndent*Number(indent)}${this._TreeUnitIndent}`;
    }
    _getCurrentRow=()=>
    {
        return this.TrOfTd(this.CurrentTd());
    }
    _getChildRows=(row)=>
    {
        let parent_id = (row.getAttribute('id')??'___');
        const child_rows = this._table.querySelectorAll(`tr[parent='${parent_id}']`);
        return child_rows;
    }

    TreeArray=(dataArray, treeOptions=null)=>
    {
        if (!treeOptions) treeOptions = this._getTreeOptions();
        
        const positionObj = (list=[], data={}) => 
        {
            let parentObj = null;
            let sourcData = null;

            const _search = listObj => 
            {
                return listObj.some((obj, idx) =>  {
                    if (data[treeOptions.parentkey] == (obj[treeOptions.key]??'_'))
                        parentObj = obj;
                    else if ((data[treeOptions.key] ?? '|') == (obj[treeOptions.key] ?? '_'))
                        sourcData = { listObj, idx };
                    return ((parentObj && sourcData) || _search((obj[treeOptions.childs]??[])));
                });
            }
            
            if (!_search(list)) return;

            const parentChilds = (parentObj[treeOptions.childs]??[]);
            parentChilds.push( ...sourcData.listObj.splice(sourcData.idx, 1) );
            parentObj[treeOptions.childs] = parentChilds;
        }

        if (dataArray && dataArray.length > 0)
        {
            let copyArray = JSON.parse(JSON.stringify(dataArray));

            copyArray.forEach(data => {
                if (data[treeOptions.parentkey] != undefined) 
                    positionObj(dataArray, data);
            });
        }

        return dataArray;
    }
    TableArray=(treeArray, treeOptions=null, treeInfo=true)=>
    {
        if (!treeOptions) treeOptions = this._getTreeOptions();
        let newArray = [];
        let level = -1;

        if (treeArray && treeArray.length > 0)
        {
            const moveToFirstLevel = listObj => 
            {
                level++;
                listObj.forEach(obj => {
                    let childsObj = JSON.parse(JSON.stringify((obj[treeOptions.childs]??[])));
                    newArray.push(obj);
                    if (!treeInfo) {
                        obj['__level__']=level;
                        obj['__havechilds__']=((obj[treeOptions.childs]??[]).length > 0);
                    }
                    if (childsObj.length > 0) {
                        delete obj[treeOptions.childs];
                        moveToFirstLevel(childsObj);
                        level--;
                    }
                });
            }

            moveToFirstLevel(treeArray);
        }
        return newArray;
    }
    SetTree=(treeData, treeOptions=null)=>
    {
        if (treeOptions) this.TreeOptions = treeOptions;
        if (treeData && treeData.length > 0)
            this.DataArray = this.TableArray(treeData, this.TreeOptions);
    }
    GetTree=(treeOptions)=>
    {
        return this.TreeArray(this.DataArray, treeOptions);
    }
    RowIndentation=(row, treeOptions=null)=>
    {
        if (!row) return null;
        return Number((row.getAttribute('indent') ?? 0));
    }
    RowIndent=(row, inFront=true, treeOptions=null)=>
    {
        if (!row) return;
        if (!treeOptions) treeOptions = this._getTreeOptions();

        const indexRow = this._getRowIndex(row);
        let sourceData = this.DataArray[indexRow];
        let targetData = null;

        if (!sourceData) return;

        if (inFront)
        {
            // Obtener el hermano superior
            let flag = false;
            const search = (list) => 
            {
                return list.some((obj, idx) => 
                {
                    if (sourceData[treeOptions.key] == (obj[treeOptions.key]??'_')) {
                        flag = true;
                        targetData = list[idx-1];
                    }
                    return (flag || search((obj[treeOptions.childs]??[])));
                });
            }

            this.GetTree(treeOptions);
            let match = search(this.DataArray);
            this.SetTree(this.DataArray, treeOptions);

            if (!match) return;
        }
        else
        {
            // Obtener el padre
            targetData = this.DataArray.find(d => (d[treeOptions.key] ?? '_') == (sourceData[treeOptions.parentkey] ?? '|'));
            if (!targetData) return;
        }

        if (sourceData && targetData)
        {
            if(this._moveData(sourceData, targetData, inFront, treeOptions))
                this._printRows();
        }
    }

    ExpandRow(row)
    {
        if (!row) return;

        const btnCollapse = row.querySelector('span.collapse-btn')
        if (btnCollapse) {
            btnCollapse.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>';
            btnCollapse.setAttribute('expanded', 'true');
        }

        const removeHidde = rows =>{
            if (rows && rows.length > 0) {
                rows.forEach(r => {
                    r.classList.remove('hidde-row');
                    // const btnCollapse = r.querySelector('span.collapse-btn')
                    // if (btnCollapse) {
                    //     btnCollapse.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>';
                    //     btnCollapse.setAttribute('expanded', 'true');
                    // }
                    //removeHidde(this._getChildRows(r));
                });
            }
        }
        const rows = this._getChildRows(row);
        removeHidde(rows);
    }
    CollapseRow(row)
    {
        if (!row) return;

        const btnCollapse = row.querySelector('span.collapse-btn')
        if (btnCollapse) {
            btnCollapse.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>';
            btnCollapse.setAttribute('expanded', 'false');
        }

        const removeHidde = rows =>{
            if (rows && rows.length > 0) {
                rows.forEach(r => {
                    r.classList.add('hidde-row');
                    const btnCollapse = r.querySelector('span.collapse-btn')
                    if (btnCollapse) {
                        btnCollapse.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>';
                        btnCollapse.setAttribute('expanded', 'false');
                    }
                    removeHidde(this._getChildRows(r));
                });
            }
        }
        const rows = this._getChildRows(row);
        removeHidde(rows);
    }

    Sort=(dataArray, field, desc=false)=>
    {
        if (dataArray && dataArray.length > 0)
        {
            dataArray.sort((a,b) => 
            {
                let valA = (a[field]??'');
                let valB = (b[field]??'');

                let numb = (typeof valA === 'number' && typeof valB === 'number');

                if (!numb) {
                    valA = valA.toString().toUpperCase();
                    valB = valB.toString().toUpperCase();
                }

                if (!desc) return (valA > valB ? 1 : valA < valB ? -1 : 0);
                else return (valB > valA ? 1 : valB < valA ? -1 : 0);
            });
        }
    }
    SortTree=(treeArray,field,desc, treeOptions=null)=>
    {
        if (!treeOptions) treeOptions = this._getTreeOptions();

        const sortData = (list) => 
        {
            if (list && list.length > 0)
            {
                list.sort((a,b) => 
                {
                    if ((a[treeOptions.childs]??[]).length > 0) { sortData(a[treeOptions.childs]); }
                    if ((b[treeOptions.childs]??[]).length > 0) { sortData(b[treeOptions.childs]); }

                    let valA = (a[field]??'');
                    let valB = (b[field]??'');

                    let numb = (typeof valA === 'number' && typeof valB === 'number');

                    if (!numb) {
                        valA = valA.toString().toUpperCase();
                        valB = valB.toString().toUpperCase();
                    }

                    if (!desc) return (valA > valB ? 1 : valA < valB ? -1 : 0);
                    else return (valB > valA ? 1 : valB < valA ? -1 : 0);
                });
            }
        }

        sortData(treeArray);
    }
}

customElements.define('edit-table', EditTable);