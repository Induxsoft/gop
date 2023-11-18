/**
 * ¿QUÉ ES UN WEB COMPONENT?
 * Es una forma de crear un bloque de código encapsulado y de
 * responsabilidad única que puede reutilizarse en cualquier
 * página.
 */

class EditSelect extends HTMLElement
{
    attributes = null;
    select = null;
    inputh = null;
    manualOption = null;
    manualInput = null;
    onChanging = null;

    // Inicializar el HTMLElement padre
    constructor() 
    {
        super();
        document.addEventListener('DOMContentLoaded', () => this.attributes = this.getAttributeNames());
    }

    // Devuelve el array de atributos que el navegador observará
    static get observedAttributes()
    {
        return  attributes;
    }

    // Se llama cada vez que se modifica un atributo
    attributeChangeCallback(property, oldValue, newValue)
    {
        if (newValue === oldValue) return;
        this[property] = newValue;
    }

    // Se llama cuando el componente se agrega al documento
    connectedCallback()
    {
        document.addEventListener('DOMContentLoaded', () => 
        {
            const shadow = this.attachShadow({ mode: 'closed' });
            const option = this.querySelectorAll('option');
            const contnr = document.createElement('div');
            const defval = this.getAttribute('value');
            this.select = document.createElement('select');
            this.inputh = document.createElement('input');

            this.select.classList.add('induxsoft-form-select');
            contnr.setAttribute('id', 'EditSelect_container');
            this.inputh.setAttribute('type', 'hidden');
            this.inputh.setAttribute('name', (this.getAttribute('name')??''));

            //=============== Manual option

            const textIndicatorManual = (this.getAttribute('manual-text') ?? 'Escribir manualmente...');
            this.manualOption = document.createElement('option');
            this.manualOption.value = -99;
            this.manualOption.textContent = textIndicatorManual;

            //=============== Input manual

            this.manualInput = document.createElement('input');
            this.manualInput.classList.add('induxsoft-form-control');
            this.manualInput.setAttribute('placeholder', textIndicatorManual);

            //=============== Events

            this.select.addEventListener('change', (e) => 
            {
                if (this.select.value === this.manualOption.value)
                {
                    this.setValue((this.select.getAttribute('text-value') ?? ''));
                }
                else
                {
                    this.setValue(e.target.value ?? '');
                }
            });

            this.manualInput.addEventListener('keyup', () => 
            {
                this.setValue(this.manualInput.value, false);
                this.select.setAttribute('text-value', this.manualInput.value);
            });

            if ((this.getAttribute('edit-options') ?? 'false') == 'true')
            {
                this.select.addEventListener('dblclick', () => 
                {
                    this.manualInput.style.zIndex = 0;
                    this.setValue((this.select.getAttribute('text-value') ?? ''));
                    this.manualInput.value = (this.select.getAttribute('text-value') ?? '');
                    this.manualInput.select();
                    this.manualInput.focus();
                });
            }

            //=============== DOM

            shadow.innerHTML = 
            `
                <style>
                    div{ position: relative !important; }
                    select{ width: 100% !important; padding: 4px 8px !important; }
                    input{ position: absolute !important; z-index: -1; left: 0; top: 0; width:85% !important; height: 60% !important; border: none !important; outline: none !important;}
                    
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

            if (option && option.length >= 1) 
                option.forEach(opt => this.select.appendChild(opt));

            this.select.appendChild(this.manualOption);

            if (defval) 
            {
                this.setValue(defval);
                if (this.select.selectedIndex >= 0)
                    this.select.setAttribute('text-value', this.select.options[this.select.selectedIndex].textContent);
                else{
                    this.select.setAttribute('text-value', defval);
                    this.select.value = this.manualOption.value;
                    this.select.dispatchEvent(new Event('change'));
                }
            }

            if (this.hasAttribute('name'))
                this.select.setAttribute('name', this.getAttribute('name'));

            contnr.appendChild(this.select);
            contnr.appendChild(this.manualInput);
            shadow.appendChild(contnr);
            this.after(this.inputh);
        });
    }
    
    setValue(value, allowFocus=true)
    {
        this.setAttribute('value', value);
        this.inputh.value = value;
        this.select.value = value;

        if ((this.select.selectedIndex < 0) || this.select.value === this.manualOption.value)
        {
            this.select.setAttribute('text-value', value);
            this.select.value = this.manualOption.value;
            this.manualInput.style.zIndex = 0;
            this.manualInput.value = (this.select.getAttribute('text-value') ?? '');
            
            if (allowFocus)
            {
                this.manualInput.select();
                this.manualInput.focus();
            }            
        }
        else
        {
            this.manualInput.style.zIndex = -1;
            this.select.setAttribute('text-value', this.select.options[this.select.selectedIndex].textContent); 
        }

        if (this.onChanging)
            this.onChanging();
    }

    getValue()
    {
        return this.getAttribute('value');
    }

    reloadSelect()
    {
        const option = this.querySelectorAll('option');
        const micopy = this.manualOption.cloneNode(true);

        this.select.innerHTML = '';

        if (option && option.length >= 1) 
            option.forEach(opt => this.select.appendChild(opt));

        this.manualOption = micopy;
        this.select.appendChild(this.manualOption);
    }
}

class InputKey extends HTMLElement
{
    attributes = null;
    data = null;
    searchData = null;
    record_selected = {};
    accept_data = null;
    table_tables_container2 = null;
    head_tables_container2 = null;
    body_tables_container2 = null;
    columns = null;
    colcaptions = null;
    inputv = null;
    input_search_container = null;
    input_search_container2 = null;
    input_description_container = null;
    accept_footer_container2 = null;
    change_event = null;

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
            this.columns = this.getAttribute('columns');
            this.colcaptions = this.getAttribute('colcaptions');

            //=============== 1 SECTION [ MAIN CONTROL ]
            
            const shadow = this.attachShadow({ mode: 'closed' });
            this.inputv = this.createFullElement('input', {id:'inputv', type:'text', value:`${this.getAttribute('value')??''}`, name:`${this.getAttribute('name')}`, style:'opacity: 0 !important;width: 1px !important; height:1px !important; border:none !important; outline:none !important; box-shadow:none !important; padding:0 !important; margin: 0 !important; pointer-events: none !important; background-color: transparent !important; position:relative !important; display:block !important; top:-15px !important;'});
            const container = this.createFullElement('div', {id:'container'});
            const search_container = this.createFullElement('div', {id:'search_container'});
            this.input_search_container = this.createFullElement('input', {id:'input_search_container', type:'text', class:'form-control induxsoft-form-control'});
            const button_search_container = this.createFullElement('button', {id:'button_search_container', type:'button', class:'induxsoft-buttons', title:'Buscar'});
            const description_container = this.createFullElement('div', {id:'description_container'});
            this.input_description_container = this.createFullElement('input', {id:'input_description_container', type:'text', readonly:'readonly', class:'induxsoft-form-control'});
            const button_add_container = this.createFullElement('button', {id:'button_add_container', type:'button', class:'induxsoft-buttons', title:'Agregar'});
            const button_edit_container = this.createFullElement('button', {id:'button_edit_container', type:'button', class:'induxsoft-buttons', title:'Editar'});
            const button_clear_container = this.createFullElement('button', {id:'button_clear_container', type:'button', class:'induxsoft-buttons', title:'Limpiar'});

            container.classList.toggle('disable-element', ((this.getAttribute('disabled')??'') === 'true'));
            this.inputv.required = ((this.getAttribute('required') ?? 'false') === 'true');

            this.input_search_container.value = (this.getAttribute('search-value') ?? '');
            this.input_description_container.value = (this.getAttribute('text-value') ?? '');
            button_search_container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`;
            button_add_container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/></svg>`;
            button_edit_container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg>`;
            button_clear_container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`;

            search_container.appendChild(this.input_search_container);
            search_container.appendChild(button_search_container);
            description_container.appendChild(this.input_description_container);
            if (this.getAttribute('add-url')) description_container.appendChild(button_add_container);
            if (this.getAttribute('edit-url')) description_container.appendChild(button_edit_container);
            description_container.appendChild(button_clear_container);
            container.appendChild(search_container);
            container.appendChild(description_container);

            //=============== 2 SECTION [ SEARCH AND SELECT ELEMENT ]

            const container2 = this.createFullElement('div', {id:'container2', class:'hide-element modal-backdrop'});
            const search_container2 = this.createFullElement('div', {id:'search_container2', class:'bg-white modal-container'});
            const header_section_container2 = this.createFullElement('div', {id:'header_section_container2', class:'d-flex modal-section modal-section-header'});
            const search_section_container2 = this.createFullElement('div', {id:'search_section_container2', class:'d-flex p-2 modal-section'});
            const tables_section_container2 = this.createFullElement('div', {id:'tables_section_container2', class:'grow-1 modal-section overflow'});
            const footer_section_container2 = this.createFullElement('div', {class:'bg-light-gray d-flex gap-1 justify-content-end p-2 modal-section'});

            // header section
            const title_header_container2 = this.createFullElement('p', {id:'title_container2', class:'text-secondary grow-1'});
            const close_header_container2 = this.createFullElement('button', {id:'close_header_container2', class:"border-0 induxsoft-buttons p-2 d-flex align-items-center justify-content-center hover-red"});
            title_header_container2.textContent = (this.getAttribute('box-title-text') ?? 'Seleccione un Registro');
            close_header_container2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#333" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`;
            header_section_container2.appendChild(title_header_container2);
            header_section_container2.appendChild(close_header_container2);

            // search section
            const button_search_container2 = this.createFullElement('button', {type:'button',class:'p-2 induxsoft-buttons'});
            this.input_search_container2 = this.createFullElement('input', {type:'text', class:'grow-1 induxsoft-form-control'});
            button_search_container2.textContent = 'Buscar';
            this.input_search_container2.setAttribute('placeholder', (this.getAttribute('box-placeholder-text') ?? 'Buscar...'));
            search_section_container2.appendChild(this.input_search_container2);
            search_section_container2.appendChild(button_search_container2);

            // tables section
            this.table_tables_container2 = this.createFullElement('table', {id:'table_tables_container2'});
            this.head_tables_container2 = this.createFullElement('thead', {id:'head_tables_container2', class:'bg-light-gray'});
            this.body_tables_container2 = this.createFullElement('tbody', {id:'body_tables_container2'});

            this.table_tables_container2.appendChild(this.head_tables_container2);
            this.table_tables_container2.appendChild(this.body_tables_container2);
            tables_section_container2.appendChild(this.table_tables_container2);

            // footer section
            this.accept_footer_container2 = this.createFullElement('button', {type:'button',class:'induxsoft-buttons'});
            const close2_footer_container2 = this.createFullElement('button', {id:'close2_container2', type:'button', class:'induxsoft-buttons'});
            this.accept_footer_container2.textContent = 'Aceptar';
            close2_footer_container2.textContent = 'Cancelar';
            footer_section_container2.appendChild(this.accept_footer_container2);
            footer_section_container2.appendChild(close2_footer_container2);

            search_container2.appendChild(header_section_container2);
            search_container2.appendChild(search_section_container2);
            search_container2.appendChild(tables_section_container2);
            search_container2.appendChild(footer_section_container2);
            container2.appendChild(search_container2);

            //=============== 3 SECTION [ ADD ELEMENT ]

            const container3 = this.createFullElement('div', {id:'container3', class:'hide-element modal-backdrop'});
            const add_container3 = this.createFullElement('div', {id:'add_container3', class:'bg-white modal-container'});
            const header_section_container3 = this.createFullElement('div', {id:'header_section_container3', class:'d-flex modal-section modal-section-header'});
            const iframe_section_container3 = this.createFullElement('div', {id:'iframe_section_container3', class:'grow-1 modal-section'});

            // header section
            const title_header_container3 = this.createFullElement('p', {id:'title_container2', class:'text-secondary grow-1'});
            const close_header_container3 = this.createFullElement('button', {id:'close_header_container2', class:"border-0 p-1 hover-red"});
            title_header_container3.textContent = (this.getAttribute('box-title-text') ?? 'Agregar registro');
            close_header_container3.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#FFF" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`;
            header_section_container3.appendChild(title_header_container3);
            header_section_container3.appendChild(close_header_container3);

            add_container3.appendChild(header_section_container3);
            add_container3.appendChild(iframe_section_container3);
            container3.appendChild(add_container3);

            //=============== 4 SECTION [ EDIT ELEMENT ]

            const container4 = this.createFullElement('div', {id:'container4', class:'hide-element modal-backdrop'});
            const edit_container4 = this.createFullElement('div', {id:'edit_container4', class:'bg-white modal-container'});
            const header_section_container4 = this.createFullElement('div', {id:'header_section_container4', class:'d-flex modal-section modal-section-header'});
            const iframe_section_container4 = this.createFullElement('div', {id:'iframe_section_container4', class:'grow-1 modal-section'});

            // header section
            const title_header_container4 = this.createFullElement('p', {id:'title_container4', class:'text-secondary grow-1'});
            const close_header_container4 = this.createFullElement('button', {id:'close_header_container4', class:"border-0 p-1 hover-red"});
            title_header_container4.textContent = (this.getAttribute('box-title-text') ?? 'Editar registro');
            close_header_container4.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#FFF" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`;
            header_section_container4.appendChild(title_header_container4);
            header_section_container4.appendChild(close_header_container4);

            edit_container4.appendChild(header_section_container4);
            edit_container4.appendChild(iframe_section_container4);
            container4.appendChild(edit_container4);

            //=============== EVENTS

            button_search_container.addEventListener('click', () => {
                this.setDataSource(this.input_search_container.value).then(()=>{
                    this.setDataInputSearch2();
                    this.search(container2, false);
                });
            });
            this.input_description_container.addEventListener('dblclick', () => {
                button_search_container.click();
            })
            close_header_container2.addEventListener('click', () => {
                container2.classList.add('hide-element');
            });
            close2_footer_container2.addEventListener('click', () => {
                container2.classList.add('hide-element');
                this.setValue(this.accept_data);
            });
            this.accept_footer_container2.addEventListener('click', () => {
                if (!this.record_selected || Object.entries(this.record_selected).length <= 0)
                {
                    alert("Debe seleccionar un registro para continuar");
                    return;
                }
                this.setValue(this.record_selected);
                container2.classList.add('hide-element');
            });
            this.input_search_container.addEventListener('click', () => {
                this.input_search_container.select();
                this.input_search_container.focus();
            });
            this.input_search_container.addEventListener('blur', (e) => {
                if (container2.classList.contains('hide-element'))
                {
                    if (!this.input_search_container.value.trim())
                    {
                        this.clear();
                    }
                    else if (!this.accept_data || Object.keys(this.accept_data).length < 1)
                    {
                        this.setDataSource(this.input_search_container.value).then(()=>{
                            this.input_search_container2.value = this.input_search_container.value;
                            this.search(container2, true);
                        });
                    }
                    else if (this.accept_data && (this.accept_data[this.getAttribute('data-search') ?? '']) != this.input_search_container.value)
                    {
                        this.setValue(this.accept_data);
                    }
                }
            });
            this.input_search_container.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' && this.input_search_container.value == "")
                    this.clear();
                else if (e.key === 'Enter')
                    this.setDataSource(this.input_search_container.value).then(()=>{
                        this.input_search_container2.value = this.input_search_container.value;
                        this.search(container2, true);
                    });
                else if (e.key === 'Escape')
                    this.input_search_container.blur();
            });
            button_search_container2.addEventListener('click', () => {
                this.searchButton(container2);
            });
            this.input_search_container2.addEventListener('keyup', (e) => {
                if (e.key === 'Enter')
                    this.searchButton(container2);
            });
            search_container2.addEventListener('keyup', (e) => {
                if (e.key === 'Escape')
                    container2.classList.add('hide-element');
            });
            button_add_container.addEventListener('click', (e) => {
                e.stopPropagation();
                let url = this.prepareUrl((this.getAttribute('add-url')??''));
                const iframe_container3 = this.createFullElement('iframe', {width:'100%', height:'100%', title:'Add element', src:url});
                iframe_section_container3.innerHTML = '';
                iframe_section_container3.appendChild(iframe_container3);
                container3.classList.remove('hide-element');
            });
            close_header_container3.addEventListener('click', () => {
                container3.classList.add('hide-element');
            });
            button_edit_container.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.getAttribute('value'))
                {
                    alert('Debe seleccionar un registro para continuar.');
                    return;
                }
                let url = this.prepareUrl((this.getAttribute('edit-url')??''));
                const iframe_container4 = this.createFullElement('iframe', {width:'100%', height:'100%', title:'Edit element', src:url});
                iframe_section_container4.innerHTML = '';
                iframe_section_container4.appendChild(iframe_container4);
                container4.classList.remove('hide-element');
            });
            button_clear_container.addEventListener('click', () => {
                this.clear();
                this.input_search_container.focus();
            });
            close_header_container4.addEventListener('click', () => {
                container4.classList.add('hide-element');
            });

            const MO = new MutationObserver(()=>{
                container.classList.toggle('disable-element', ((this.getAttribute('disabled')??'') === 'true'));
            });

            MO.observe(this, {
                attributes: true,
                attributeFilter: ['disabled']
            });
            
            //=============== STYLES

            shadow.innerHTML = `
                <style>
                    /* ========== General */
                    *{ box-sizing: border-box; margin: 0; padding: 0; }
                    .hide-element{ display: none !important; }
                    .text-secondary{ color: #888; }
                    .text-white{color: #FFF;}
                    .bg-white{ background-color: #FFF;}.bg-red{ background-color: #F00; }.bg-light-gray{ background-color: #F5F5F5; }.bg-gray{background-color:#C0C0C0;}
                    .d-flex{ display:flex; align-items:center;}
                    .gap-1{gap:4px;}.gap-2{gap:8px;}
                    .grow-1{ flex-grow: 1; }
                    .border-0{ border:none; outline:none; }.border-1{border:1px solid #EEE;}
                    .p-1{ padding: 2px; }.p-2{ padding: 4px; }.p-3{ padding: 8px; }.p-4{ padding: 16px; }.p-5{ padding: 32px; }
                    .ps-1{ padding-left: 2px; }.ps-2{ padding-left: 4px; }.ps-3{ padding-left: 8px; }.ps-4{ padding-left: 16px; }.ps-5{ padding-left: 32px; }
                    .pe-1{ padding-right: 2px; }.pe-2{ padding-right: 4px; }.pe-3{ padding-right: 8px; }.pe-4{ padding-right: 16px; }.pe-5{ padding-right: 32px; }
                    .justify-content-start{ justify-content: start; }.justify-content-center{ justify-content: center; }.justify-content-end{ justify-content: end; }
                    .hover-red:hover{ background-color:#F00; }.hover-gray:hover{ background-color:#DDD !important; }
                    .fw-500{font-weight: 500;}
                    .btn-sm{display: flex; align-items:center; justify-content: center; padding: 0 5px; border: none; outline:1px solid #888;}
                    .modal-backdrop{ width: 100vw; height: 100vh; position: fixed; top:0; left:0; padding:0; margin: 0; display:flex; align-items:center; justify-content:center; z-index: 1000; }
                    .modal-container{ width: 40rem; height: 30rem; border:1px solid #ededed; box-shadow: 1px 3px 6px 0 #DDD; display:flex;flex-direction: column; }
                    .modal-section{ border-bottom:1px solid #DDD; }
                    .modal-section-header{ padding: 6px 10px; }
                    .overflow{ overflow:auto; }
                    .disable-element{ pointer-events: none !important; opacity: .5 !important; }

                    /* ========== 1 Section */
                    #container{ display: grid; grid-template-columns: 40% 60%; }
                    #search_container, #description_container{ display: flex; padding:0 4px;}
                    #input_search_container, #input_description_container{ padding: 4px 8px; width: 100%; }

                    /* ========== 2 Section */
                    #table_tables_container2{width:100%;border-spacing: 0;}
                    th,td{ border: 1px solid #DDD; }
                    th{text-align:start;}
                    #body_tables_container2{text-wrap: nowrap;}
                    .row_table{cursor: default;}
                    .row_table:hover{background-color:#F5F5F5;color:#000;}
                    .row_selected{background-color:#3D75DD !important;color:#FFF !important;}

                    @media screen and (max-width:600px) {
                        #search_container2{width: 100%;}
                    }

                    .induxsoft-form-control{border: none; outline:1px solid #ced4da;display: block;width: 100%;padding: 0.375rem 0.75rem !important;font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-clip: padding-box;appearance: none;transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .induxsoft-form-control:disabled, .induxsoft-form-control[readonly] {background-color: #e9ecef;opacity: 1;
                    }
                    .induxsoft-buttons{font-weight: 400;line-height: 1.5;color: #212529;text-align: center;text-decoration: none;vertical-align: middle;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;user-select: none;background-color: #FFF;outline:1px solid #ced4da;border: none;padding: 0.375rem 0.75rem;font-size: 1rem;transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .induxsoft-buttons:hover{color: #212529;background-color: #F5F5F5;
                    }
                    .induxsoft-form-select {display: block;width: 100%;padding: 0.375rem 2.25rem 0.375rem 0.75rem !important;-moz-padding-start: calc(0.75rem - 3px);font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");background-repeat: no-repeat;background-position: right 0.75rem center;background-size: 16px 12px;border: none;outline:1px solid #ced4da;-webkit-appearance: none;-moz-appearance: none;appearance: none;
                    }

                    ` + (this.getAttribute('control-styles') ?? '') + `
                    
                </style>
            `;

            shadow.appendChild(container);
            shadow.appendChild(container2);
            shadow.appendChild(container3);
            shadow.appendChild(container4);
            this.after(this.inputv);

            if (this.hasAttribute('data-value'))
            {
                try{
                    let initvalue = JSON.parse(this.getAttribute('data-value')??'{}');
                    this.setValue(initvalue);
                }catch{
                    alert('El valor del atributo "data-value" tiene un formato JSON inválido');
                }
            }
        });
    }
    /**
     * @param {string} tagName Nombre de etiqueta.
     * @param {object} attributes Objeto que representan los atributos del elemento, ej: {id:'miElement',class:'mi-element'}
     * @returns Retorna un **nuevo elemento HTML**
     */
    createFullElement(tagName="div", attributes={})
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    /**
     * Pinta la información en la tabla de búsqueda.
     * @returns retorna el elemento ***tbody*** de la tabla
     */
    printTableData()
    {
        this.body_tables_container2.innerHTML = ``;
        this.head_tables_container2.innerHTML = ``;

        if (!this.data || this.data.length <= 0)
        { 
            this.body_tables_container2.innerHTML = `<p class="p-3 text-secondary">${(this.getAttribute('box-nodata-text')??'Sin registros')}</p>`; 
            return;
        }

        const titles = (this.colcaptions ? this.colcaptions.split(',') : Object.keys(this.data[0]));
        const fields = (this.columns ? this.columns.split(',') : Object.keys(this.data[0]));

        while (fields.length > titles.length && fields.length <= Object.keys(this.data[0]).length)
            titles[titles.length] = fields[titles.length];

        while (titles.length > fields.length && titles.length <= Object.keys(this.data[0]).length)
            fields[fields.length] = Object.keys(this.data[0])[fields.length];
            
        const tr_tables_container2 = this.createFullElement('tr', {id:'tr_tables_container2'});
        
        titles.forEach(title => 
        {
            const t = this.createFullElement('th',{class:'fw-500 border-1 p-2 ps-3 pe-3'});
            t.textContent = title.trim();
            tr_tables_container2.appendChild(t);
        });
        
        this.head_tables_container2.appendChild(tr_tables_container2);

        this.data.forEach((dt, i) => 
        {
            const row_tables_conatiner2 = this.createFullElement('tr',{class:'row_table', value:`${dt[this.getAttribute('data-search')]}`, tabindex:`0`});
            row_tables_conatiner2.addEventListener('click', (e) => 
            {
                e.stopPropagation();
                this.findValue(e.target.parentNode.getAttribute('value'));
                e.target.parentNode.parentNode.childNodes.forEach(child => child.classList.remove('row_selected'));
                e.target.parentNode.classList.add('row_selected');
            });
            row_tables_conatiner2.addEventListener('dblclick', () => {
                this.accept_footer_container2.click();
            });
            row_tables_conatiner2.addEventListener('keyup', (e) => 
            {
                switch(e.key)
                {
                    case "ArrowRight":
                    case "ArrowDown":
                        if(e.target.nextElementSibling)e.target.nextElementSibling.focus();
                        else if(this.body_tables_container2.firstChild) this.body_tables_container2.firstChild.focus();
                        break;
                    case "ArrowLeft":
                    case "ArrowUp":
                        if(e.target.previousElementSibling)e.target.previousElementSibling.focus();
                        else if(this.body_tables_container2.lastChild) this.body_tables_container2.lastChild.focus();
                        break;
                    case "Enter":
                        this.accept_footer_container2.click();
                        break;
                }
            });
            row_tables_conatiner2.addEventListener('focus', (e) => 
            {
                e.stopPropagation();
                this.findValue(e.target.getAttribute('value'));
                e.target.parentNode.childNodes.forEach(child => child.classList.remove('row_selected'));
                e.target.classList.add('row_selected');
            });
            fields.forEach(field => 
            {
                const cell = this.createFullElement('td',{class:'border-1 p-1 ps-2 pe-2'});
                cell.textContent = dt[field.trim()];
                row_tables_conatiner2.appendChild(cell);
            });
            this.body_tables_container2.appendChild(row_tables_conatiner2);
        });

        return this.body_tables_container2;
    }
    /**
     * Establece el objeto de datos a partir de un identificador con el cual se realizará la búsqueda de similitudes.
     * @param {string} id Cadena con el valor a buscar.
     * @returns retorna un objeto **promise** al que se le puede adjuntar un *callback* de retorno.
     */
    setDataSource(id="")
    {
        this.data = null;
        let url = this.getAttribute('data-source');

        return new Promise(resolve => {
            if (url && id.trim() != "")
            {
                this.request(url.replace('@search', id), (dataSuccess) => {
                    this.data = dataSuccess;
                    this.findValue(id);
                    resolve();
                }, (dataFail) => {
                    alert("Ocurrió un error al invocar el servicio.\n\n" + dataFail);
                });
            }
            else if(this.hasAttribute('data-source-array') && this.getAttribute('data-source-array').trim() != '')
            {
                try{ this.data = JSON.parse(this.getAttribute('data-source-array')); }
                catch{ alert('El valor del atributo "data-source-array" tiene un formato JSON inválido'); }
                if (id && this.data){
                    this.data = this.data.filter(data => data[this.getAttribute('data-search')].includes(id));
                }
                this.findValue(id);
                resolve();
            }
            else
            {
                resolve();
            }
        });
    }
    /**
     * @param {string} id Cadena con el valor a buscar.
     * @returns Retorna un **elemento** dentro del objeto de datos que coincida con el valor especificado establecido en la propiedad searchData y el identificador proporcionado.
     */
    findValue(id)
    {
        if (this.data && this.data.length > 0)
        {
            this.record_selected = this.data.find(d => d[this.getAttribute('data-search')] == id);
        }
        return this.record_selected;
    }
    /**
     * @returns Retorna el **objeto** seleccionado en la tabla de datos.
     */
    getValue()
    {
        return this.accept_data;
    }
    /**
     * Establece el valor del control.
     * @param {object} value Objeto a establecer
     */
    setValue(value={})
    {
        this.accept_data = value;

        if(!this.accept_data || Object.entries(this.accept_data).length <= 0)
        {
            this.input_search_container.value = '';
            this.input_description_container.value = '';
            this.setAttribute('value', '');
            this.inputv.setAttribute('value', '');
        }
        else
        {
            this.input_search_container.value = (this.accept_data[this.getAttribute('data-search')]??'');
            this.input_description_container.value = (this.accept_data[this.getAttribute('data-text')]??'');
            this.setAttribute('value', this.accept_data[this.getAttribute('data-key')]??'');
            this.inputv.setAttribute('value', this.accept_data[this.getAttribute('data-key')]??'');
        }

        if (this.change_event)
            this.change_event(value);
    }
    /**
     * Limpia la información del objeto seleccionado y los controles del componente.
     */
    clear()
    {
        this.accept_data = null;
        this.record_selected = null;
        this.setValue(null);
    }
    /**
     * Abre la tabla de busqueda
     * @param {HTMLElement} container2 Referencia del contenedor principal de la tabla de búsqueda
     * @param {Boolean} autoselect Define la selección automática de un elemento al lanzarse la búsqueda y encontrarse una sola coincidencia.
     */
    search(container2, autoselect=false)
    {
        if (this.data && this.data.length == 1 && this.record_selected && autoselect)
        {
            this.setValue(this.record_selected);
        }
        else
        {
            this.printTableData();
            container2.classList.remove('hide-element');
            if(!this.data || this.data.length <= 0)
            {
                this.input_search_container2.select();
                this.input_search_container2.focus();
            }
            else
            {
                this.body_tables_container2.childNodes[0].focus();
            }
        }
    }
    /**
     * Lanza la búsqueda de un elemento.
     * @param {HTMLElement} container2 Referencia del contenedor principal de la tabla de búsqueda.
     */
    searchButton(container2)
    {
        if (this.input_search_container2.value.trim() == ""){
            alert("Debe especificar el texto a buscar para continuar");
            this.input_search_container2.focus();
            return;
        }
        if (!this.getAttribute('data-source')){
            alert('No se ha especificado una URL de origen para realizar la busqueda');
            return;
        }

        this.setDataSource(this.input_search_container2.value).then(()=>{
            this.search(container2, false);
        });
    }
    /**
     * Sincroniza el valor del campo de búsqueda del primer control del componente con el campo de búsqueda de la tabla de datos.
     */
    setDataInputSearch2()
    {
        this.input_search_container2.value = this.input_search_container.value;
        this.input_search_container2.select();
        this.input_search_container2.focus();
    }
    /**
     * Sobrescribe el escuchador de eventos del componente con el definido por el usuario.
     * @param {string} ename Nombre del evento.
     * @param {object} func Función a disparar con el evento.
     */
    addEventListener(ename, func)
    {
        switch(ename)
        {
            case 'change':
                this.change_event = func;
                break;
        }
    }
    /**
     * Procesa la URL proporcionada para remplazar las claves que contenga con los valores del control.
     * @param {string} url URL a procesar.
     * @returns Retorna la nueva URL
     */
    prepareUrl(url)
    {
        return url.replace('@search',this.input_search_container.value)
            .replace('@key',this.getAttribute('value')??'')
            .replace('@text', this.input_description_container.value);
    }
    request(url, success, fail)
    {
        fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers:{
                'Access-Control-Allow-Origin':'*'
            }
        }).then(response => {
            if (response.ok){
                response.json().then(json => {
                    success(json);
                });
            }
            else{
                fail("El servicio respondió con un estado unválido");
            }
        })
        .catch(error => {
            fail(error.message);
        })
    }
}

class CheckList extends HTMLElement
{
    attributes = null;
    data = {};
    locked = null;
    doneStyle = null;
    canRemove = null;
    canEdit = null;
    canMove = null;
    canCheck = null;
    canAdd = null;
    showPercents = null;

    onItemChanged = null;
    onItemChecked = null;
    onItemMoved = null;

    _containerwc = null;
    _headSection = null;
    _titleHeader = null;
    _bodySection = null;
    _footSection = null;
    _btnDropDown = null;
    _footHeader = null;
    _textDropDown = null;
    _topPositionDragEvent = true;
    _isChildItemDragEvent = true;
    _draggingItem = null;

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
            const shadow =      this.attachShadow({ mode: 'closed' });
            this.locked =       this._parseBool(this.getAttribute('data-locked'));
            this.doneStyle =    this._parseInt(this.getAttribute('data-done-style'));
            this.canRemove =    this._parseBool(this.getAttribute('can-remove'));
            this.canEdit =      this._parseBool(this.getAttribute('can-edit'));
            this.canMove =      this._parseBool(this.getAttribute('can-move'));
            this.canCheck =     this._parseBool(this.getAttribute('can-check'), true);
            this.canAdd =       this._parseBool(this.getAttribute('can-add'), true);
            this.showPercents = this._parseBool(this.getAttribute('show-percents'));

            this._containerwc = this._createFullElement('div', { id:'CL_container', class:'bordered d-flex flex-column' });
            this._headSection = this._createFullElement('div', { id:'CL_headerSection', class:'p-3 d-flex' });
            this._bodySection = this._createFullElement('div', { id:'CL_bodySection', class:'grow-1' });
            this._footSection = this._createFullElement('div', { id:'CL_footSection'});

            // head section
            this._titleHeader = this._createFullElement('input', { id:'CL_title_headSection', type: 'text', class:'w-100 fz-big2 p-2 noborder', placeholder:'Título'});
            this._headSection.appendChild(this._titleHeader);
            this._containerwc.appendChild(this._headSection);

            // body section
            this._containerwc.appendChild(this._bodySection);

            // foot section
            this._containerwc.appendChild(this._footSection);
            this._footHeader = this._createFullElement('div', { id:'CL_footHeader', class:'ps-2 pe-2 hide-element' });
            this._btnDropDown = this._createFullElement('button', { id:'CL_btnDropDown', class:'d-flex align-items-center gap-2 noborder bg-transparent p-3' });
            const _svgDropDown = this._createFullElement('div', { class:'d-flex align-items-center justify-content-center' });
            this._textDropDown = this._createFullElement('span');

            _svgDropDown.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>`;

            this._btnDropDown.appendChild(_svgDropDown);
            this._btnDropDown.appendChild(this._textDropDown);
            this._footHeader.appendChild(this._btnDropDown);
            this._footSection.before(this._footHeader);

            // events
            this._titleHeader.addEventListener('keyup', () => {
                this.data['text'] = this._titleHeader.value;
            });
            this._btnDropDown.addEventListener('click', () => {
                if (this._footSection.classList.contains('hide-element'))
                {
                    this._footSection.classList.remove('hide-element');
                    _svgDropDown.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>`;
                }
                else
                {
                    this._footSection.classList.add('hide-element');
                    _svgDropDown.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>`;
                }
            });
            this._footSection.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return;
            });

            shadow.innerHTML = `
                <style>
                    /* ========== General */
                    *{ box-sizing: border-box;margin:0;padding:0; }
                    .d-flex{ display:flex; }
                    .flex-column{ flex-direction: column; }
                    .gap-1{gap:4px;} .gap-2{gap:8px;}
                    .justify-content-start{ justify-content: start; } .justify-content-center{ justify-content: center; } .justify-content-end{ justify-content: end; }
                    .align-items-start{ align-items: start; } .align-items-center{ align-items: center; } .align-items-end{ align-items: end; }
                    .fz-sm{ font-size: .8rem; } .fz-normal{ font-size: 1rem; } .fz-big1{ font-size: 1.2rem; } .fz-big2{ font-size: 1.4rem; }
                    .grow-1{ flex-grow: 1; }
                    .w-100{ width: 100%; }
                    .bordered{ border: 1px solid #DDD; }
                    .noborder{ border: none !important; outline: none !important; }
                    .rounded{ border-radius: 6px; }
                    .rounded-50{ border-radius: 50%; }
                    .p-1{ padding: 4px; } .p-2{ padding: 8px; } .p-3{ padding: 12px; } .p-4{ padding: 16px; } .p-5{ padding: 32px; }
                    .ps-1{ padding-left: 4px; }.ps-2{ padding-left: 8px; }.ps-3{ padding-left: 12px; }.ps-4{ padding-left: 16px; }.ps-5{ padding-left: 32px; }
                    .pe-1{ padding-right: 4px; }.pe-2{ padding-right: 8px; }.pe-3{ padding-right: 12px; }.pe-4{ padding-right: 16px; }.pe-5{ padding-right: 32px; }
                    .bg-white{ background-color: #FFF;} .bg-light-gray{ background-color: #F5F5F5; } .bg-transparent{background-color:transparent;}
                    .hide-element{ display: none !important; }
                    .disable-element{ pointer-events: none !important; opacity: .5 !important; }
                    .disable-element-op0{ pointer-events: none !important; opacity: 0 !important; }
                    .borderxy4{ border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
                    .border-t{ border-top-color: #005CC8; }
                    .border-b{ border-bottom-color: #005CC8; }
                    .dragging{ background-color: #F0F8FF; }

                    /* ========== List */
                    .list-item-new{ display: grid; grid-template-columns: 1rem 1rem 1fr; gap:4px;}
                    .list-item{ display: grid; grid-template-columns: 1rem 1rem 1fr 2rem; gap:4px;}
                    .sub-item{ padding-left: 1.6rem; }
                    .hover-item:focus-within{ outline: 1px solid #DDD !important; }
                    .movItem, .delItem{ position: relative; left: -1000rem; }
                    .hover-item:hover > div > button{ left: 0; }
                    .delItem:hover{ background-color: #F5F5F5; fill: #000 !important; color: #000 !important; cursor: pointer; }
                    .movItem:hover{ cursor: move ; }
                    #CL_btnDropDown:hover{ !important; cursor: pointer !important; }
                    #CL_footHeader{ border-top: 1px solid #DDD !important; transition: .3s; }
                    #CL_footHeader:hover{ background-color: #f5f5f5; }
                    .in-done-list .list-item .movItem{ pointer-events: none !important; opacity: 0 !important; }
                </style>
            `;

            shadow.appendChild(this._containerwc);
            this._refreshView();

            if (this.hasAttribute('data') && this.getAttribute('data').trim())
            {
                try
                {
                    this.setData(JSON.parse(this.getAttribute('data')));
                }
                catch(error)
                {
                    alert('El valor del atributo "data" no contiene un formato JSON válido');
                    this.data = {};
                }
            }
        });
    }

    _parseBool(value, _default = false)
    {
        if (value) return (value.toLowerCase() === 'true');
        return _default;
    }
    _parseInt(value, _default = 0)
    {
        if (value != null && isFinite(value.trim()) && !isNaN(value.trim())) { return parseInt(value.trim()); }
        return _default;
    }
    _createFullElement(tagName="div", attributes={})
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    _refreshView()
    {
        this._valideCheckedItems();

        // title
        this._titleHeader.value = (this.data?.text ?? '');
        this._bodySection.innerHTML = ``;
        this._footSection.innerHTML = ``;
        this._footHeader.classList.add('hide-element');

        this._titleHeader.classList.toggle('disable-element', !this.canEdit);

        // New item
        let id = this._generateUUID()
        const newItem = this._createRowItem(null, { isNew: true, id: id});

        // Items List
        if (this.data && this.data.items && this.data.items.length > 0)
        {
            this.data.items.forEach(item => 
            {
                let id = (item.id ?? this._generateUUID());
                this._bodySection.appendChild(this._createRowItem(item, { id: id }));

                if (item.items && item.items.length > 0)
                    item.items.forEach(subItem => { 
                        this._bodySection.appendChild(this._createRowItem(subItem, { isNew: false, isSubItem: true, id: (subItem.id ?? this._generateUUID()), parentId: id }))
                    });
            });
        }

        this._bodySection.appendChild(newItem);
        this._reprintElementChecked();
    }
    _generateUUID()
    {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, 
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    _createRowItem(item, params = { isNew: false, isSubItem: false, id: '', parentId:''})
    {
        let containerItem = null;
        if (params.isNew)
        {
            containerItem = this._createFullElement('div', { id:'CL_newCont', class:'hover-item p-2 pe-3 bg-white', style:'margin-top: 1px;' });
            const newItem = this._createFullElement('div', { id:'CL_newItem', class:'list-item-new', 'item-id': params.id });
            const newEmpt = this._createFullElement('div');
            const newIcon = this._createFullElement('div', { class:'d-flex align-items-center justify-content-center' });
            const newText = this._createFullElement('input', { type:'text', class:'p-2 noborder w-100 bg-transparent', placeholder:'Elemento de lista'});

            newIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" class="bi bi-plus-lg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/></svg>`;

            newItem.appendChild(newEmpt);
            newItem.appendChild(newIcon);
            newItem.appendChild(newText);
            containerItem.appendChild(newItem);

            if (!this.canAdd) containerItem.classList.add('hide-element');

            newText.addEventListener('blur', () => {
                if (newText.value.trim() != ""){
                    const newItemElement = this._createRowItem({ text: newText.value.trim() }, { id: this._generateUUID() });
                    newText.value = "";
                    this._addOrUpdateItem(newItemElement);
                }
            });
            newText.addEventListener('keyup', (e) => {
                if (newText.value.trim() != "" && e.key === 'Enter'){
                    const newItemElement = this._createRowItem({ text: newText.value.trim() }, { id: this._generateUUID() });
                    newText.value = "";
                    this._addOrUpdateItem(newItemElement);
                }
            });
        }
        else
        {
            containerItem = this._createFullElement('div', { class:'hover-item bg-white ps-1 pe-3 borderxy4', 'item-id':`${params.id}`, style:'position: relative; margin-top: 1px;' });
            const rowItem = this._createFullElement('div', { class:'list-item' });
            const movItem = this._createFullElement('button', { class: 'movItem noborder', style: 'background: transparent;', draggable: 'true' });
            const chkItem = this._createFullElement('input', { type:'checkbox' });
            const txtItem = this._createFullElement('input', { type:'text', class:'p-2 noborder w-100 bg-transparent'});
            const delItem = this._createFullElement('button', { class:'delItem noborder bg-transparent d-flex align-items-center justify-content-center' });
            const childIcon = this._createFullElement('div', { style:'position:absolute; top: 5px; left: 2px;', class:'hide-element'});
            
            childIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#005CC8" class="bi bi-arrow-right-short" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/></svg>`;
            movItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>`;
            delItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`;
            txtItem.value = item.text;
            chkItem.checked = (item.done ?? false);
            containerItem.setAttribute('item-text', item.text);
            containerItem.setAttribute('item-done', chkItem.checked);

            if (params.isSubItem)
            {
                containerItem.classList.add('sub-item');
                containerItem.setAttribute('parent-id', params.parentId);
            }

            if (chkItem.checked && this.locked) chkItem.classList.add('disable-element');
            if (!this.canRemove) delItem.classList.add('hide-element');
            if (!this.canEdit) txtItem.classList.add('disable-element');
            if (!this.canMove) movItem.classList.add('disable-element-op0');
            if (!this.canCheck) chkItem.classList.add('disable-element');

            rowItem.appendChild(movItem);
            rowItem.appendChild(chkItem);
            rowItem.appendChild(txtItem);
            rowItem.appendChild(delItem);
            containerItem.appendChild(rowItem);
            containerItem.appendChild(childIcon);

            delItem.addEventListener('click', () => {
                this._addOrUpdateItem(containerItem, true);
            });
            txtItem.addEventListener('keyup', (e) => {
                containerItem.setAttribute('item-text', txtItem.value);
                this._addOrUpdateItem(containerItem);
                if (e.key === 'Enter' && containerItem.nextElementSibling && containerItem.nextElementSibling.childNodes[0] && containerItem.nextElementSibling.childNodes[0].childNodes[2]){
                    containerItem.nextElementSibling.childNodes[0].childNodes[2].focus();
                }
            });
            chkItem.addEventListener('click', () => {
                containerItem.setAttribute('item-done', chkItem.checked);
                this._addOrUpdateItem(containerItem);
                this._refreshView();
                if (chkItem.checked && this.onItemChecked)
                {
                    let item = this.getItem((containerItem.getAttribute('item-id')??''))
                    this.onItemChecked(item);
                }
                if (chkItem.checked && this.locked)
                    chkItem.classList.add('disable-element');
            });


            containerItem.addEventListener('dragstart', (e) => {
                this._draggingItem = containerItem;
                e.dataTransfer.setData('text/plain', containerItem.getAttribute('item-id'));
                containerItem.classList.add('dragging');
                let item = this.getItem(containerItem.getAttribute('item-id'));
                if (item && item.items && item.items.length > 0)
                {
                    this._bodySection.childNodes.forEach(itemList => {
                        item.items.forEach(item => {
                            if (item.id == itemList.getAttribute('item-id'))
                                itemList.classList.add('disable-element');
                        });
                    });
                }
            });
            containerItem.addEventListener('dragend', () => {
                containerItem.classList.remove('dragging');
                this._draggingItem = null;
                let item = this.getItem(containerItem.getAttribute('item-id'));
                if (item && item.items && item.items.length > 0)
                {
                    this._bodySection.childNodes.forEach(itemList => {
                        item.items.forEach(item => {
                            if (item.id == itemList.getAttribute('item-id'))
                                itemList.classList.remove('disable-element');
                        });
                    });
                }
            })
            containerItem.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (containerItem.classList.contains('in-done-list')) return;
                if (this._draggingItem && containerItem.getAttribute('item-id') == this._draggingItem.getAttribute('item-id')) return;
                const rect = containerItem.getBoundingClientRect();
                const limity = (rect.y + (rect.height / 2));
                const limitx = (rect.x + (rect.width / 5))

                let y = (e.clientY < limity);
                let x = (!y && e.clientX > limitx);

                containerItem.classList.toggle('border-b', !y);
                containerItem.classList.toggle('border-t', y);
                if ((containerItem.getAttribute('parent-id')??'') == '')
                {
                    containerItem.classList.toggle('bg-light-gray', x);
                    childIcon.classList.toggle('hide-element', !x);
                }

                this._topPositionDragEvent = y;
                this._isChildItemDragEvent = x;
            });
            containerItem.addEventListener('dragleave', (e) => {
                containerItem.classList.remove('border-b');
                containerItem.classList.remove('border-t');
                containerItem.classList.remove('bg-light-gray');
                childIcon.classList.add('hide-element');
            });
            containerItem.addEventListener('drop', (e) => {
                e.preventDefault();
                if (containerItem.classList.contains('in-done-list')) return;
                containerItem.classList.remove('border-b');
                containerItem.classList.remove('border-t');
                containerItem.classList.remove('bg-light-gray');
                childIcon.classList.add('hide-element');

                let itemId = e.dataTransfer.getData("text");
                let itemDrop = null;
                this._bodySection.childNodes.forEach(item => {
                    if (item.getAttribute('item-id') == itemId)
                        itemDrop = item;
                });

                if (itemDrop && containerItem.getAttribute('item-id') == itemDrop.getAttribute('item-id')) return;

                if (itemDrop)
                {
                    itemDrop.classList.remove('dragging');

                    let index = 0;
                    let sourceItem = this.getItem(itemDrop.getAttribute('item-id'), false);
                    
                    if (sourceItem)
                    {
                        if (sourceItem.subindex != undefined) 
                            this.data.items[sourceItem.subindex].items.splice(sourceItem.index, 1);
                        else
                            this.data.items.splice(sourceItem.index, 1);
                    }

                    let targetItem = this.getItem(containerItem.getAttribute('item-id'), false);
                    
                    if (!this._topPositionDragEvent)
                        index = 1;
                    
                    if (targetItem)
                    {
                        index += targetItem.index;
                        delete sourceItem.index;
                        delete sourceItem.subindex;

                        if (targetItem.subindex != undefined)
                        {
                            let subitemsSource = JSON.parse(JSON.stringify(sourceItem.items ?? []));
                            if (subitemsSource && subitemsSource.length > 0)
                                delete sourceItem.items;
                            this.data.items[targetItem.subindex].items.splice(index, 0, sourceItem);
                            subitemsSource.forEach(subitem => {
                                index ++;
                                this.data.items[targetItem.subindex].items.splice(index, 0, subitem);
                            });
                        }
                        else if (this._isChildItemDragEvent)
                        {
                            let subitems = (this.data.items[targetItem.index].items??[]);
                            let subitemsSource = JSON.parse(JSON.stringify(sourceItem.items ?? []));
                            if (subitemsSource && subitemsSource.length > 0)
                                delete sourceItem.items;
                            subitems.unshift(sourceItem);
                            let _index = 0;
                            subitemsSource.forEach(subitem => {
                                _index ++;
                                subitems.splice(_index, 0, subitem);
                            });
                            this.data.items[targetItem.index].items = subitems;
                        }
                        else
                        {
                            this.data.items.splice(index, 0, sourceItem);
                        }
                        if (this.onItemMoved) this.onItemMoved(sourceItem);
                    }
                }
                this._refreshView();
            });
        }

        return containerItem;
    }
    _reprintElementChecked()
    {
        this._footSection.innerHTML = '';

        switch(this.doneStyle)
        {
            case 0:
            {
                this._footHeader.classList.add('hide-element');
                break;
            }
            case 1:
            {
                let checkedItems = this._getCheckedItems();
                let lastParendtId = '🧔';

                checkedItems.forEach(itemChecked => 
                {
                    this._bodySection.childNodes.forEach(itemList => 
                    {
                        if (itemChecked.id == itemList.getAttribute('item-id'))
                        {
                            let parentId = (itemList.getAttribute('parent-id') ?? '');
                            if (parentId && parentId != lastParendtId)
                            {
                                lastParendtId = parentId;
                                let parentItemList = null; 
                                this._bodySection.childNodes.forEach(item => { 
                                    if(item.getAttribute('item-id') == parentId)  
                                        parentItemList = item;
                                });
                                if (parentItemList)
                                {
                                    const parentClone = parentItemList.cloneNode(true);
                                    parentClone.classList.add('disable-element');
                                    this._footSection.appendChild(parentClone);
                                }
                            }
                            itemList.classList.add('in-done-list');
                            this._footSection.appendChild(itemList);
                        }
                    });
                });
                
                if (checkedItems.length > 0)
                {
                    this._footHeader.classList.remove('hide-element');
                    let text = (checkedItems.length == 1 ? ' Elemento completado' : ' Elementos completados');
                    this._textDropDown.textContent = checkedItems.length + text;
                }
                break;
            }
            case 2:
            {
                this._footHeader.classList.add('hide-element');
                let checkedItems = this._getCheckedItems();
                checkedItems.forEach(item => this._bodySection.childNodes.forEach(itemList => { if (item.id == itemList.getAttribute('item-id')) itemList.remove(); }));
                break;
            }
        }
    }
    __addOrUpdateItem(element, del=false, data=null)
    {
        if (data == null) data = this.data;
        
        let updated = false;
        let items = (data?.items??[]);
        let itemId = (element.getAttribute('item-id') ?? '_');
        let parentId = (element.getAttribute('parent-id')??'_');

        if (items && items.length > 0)
        {
            items.forEach((item, i) => 
            {
                if (!updated && itemId == item.id)
                {
                    if (del)
                    {
                        let delSubItems = [];

                        if (items[i].items && items[i].items.length > 0)
                        {
                            this._bodySection.childNodes.forEach((itm) => {
                                if ((itm.getAttribute('parent-id')??'') == itemId) delSubItems.push(itm);
                            });
                        }
                        items.splice(i, 1);
                        delSubItems.forEach(subItem => subItem.remove());
                        element.remove();
                    }
                    else
                    {
                        items[i].text = element.getAttribute('item-text');
                        items[i].done = ((element.getAttribute('item-done') ?? '') === 'true');
                        if (items[i].items && items[i].items.length > 0)
                            items[i].items.forEach(subitem => subitem.done = items[i].done);
                        if (this.onItemChanged)
                            this.onItemChanged(item);
                    }
                    updated = true;
                }
                else if (item.items && item.items.length > 0 && parentId == item.id)
                {
                    items[i].items = this.__addOrUpdateItem(element, del, item);
                    updated = true;
                }
            });
        }

        if (!updated)
        {
            items.push({
                id: element.getAttribute('item-id'), 
                text: element.getAttribute('item-text'),
                done: ((element.getAttribute('item-done') ?? '') === 'true'),
                _meta: {
                    percent: -1, 
                    progress: '100'
                }
            });
            this._bodySection.lastChild.before(element);
        }

        return items;
    }
    _addOrUpdateItem(element, del=false)
    {
        this.data['items'] = this.__addOrUpdateItem(element, del);
        this._valideCheckedItems();
    }
    _valideCheckedItems()
    {
        if (this.data && this.data.items && this.data.items.length > 0)
        {
            this.data.items.forEach(item => 
            {
                if (item.items && item.items.length > 0)
                {
                    let allSubItemsChecked = true;
                    item.items.forEach(subItem => {
                        if(!subItem.done) allSubItemsChecked = false;
                    });
                    item.done = allSubItemsChecked;
                }
            });
        }
    }
    _getCheckedItems()
    {
        let itemsCompleted = [];
        if (this.data && this.data.items && this.data.items.length > 0)
        {
            this.data.items.forEach(item => {
                if (item.done == true) itemsCompleted.push(item);
                if (item.items && item.items.length > 0){
                    item.items.forEach(subitem => {
                        if (subitem.done == true) itemsCompleted.push(subitem);
                    });
                }
            });
        }
        return itemsCompleted;
    }
    setData(obj)
    {
        this.data = obj;
        
        if (this.data && this.data.items && this.data.items.length > 0)
        {
            this.data.items.forEach(item => 
            {
                item['id'] = (item.id ?? this._generateUUID());
                item['_meta'] =  { percent:(item.meta?.percent ?? -1), progress:(item.meta?.progress ?? '100') };
                if (item.items && item.items.length > 0)
                {
                    item.items.forEach(subItem => { 
                        subItem['id'] = (subItem.id ?? this._generateUUID());
                        subItem['_meta'] = { percent:(subItem.meta?.percent ?? -1), progress:(subItem.meta?.progress ?? '100') };
                    });
                }
            });
        }
        this._refreshView();
    }
    getData(withoutmeta = false)
    {
        let temp = JSON.parse(JSON.stringify(this.data));
        
        if (withoutmeta)
        {
            temp.items.forEach(t => {
                delete t._meta
                if (t.items && t.items.length > 0)
                    t.items.forEach(s => delete s._meta);
            });
        }
        
        return temp;
    }
    getItem(id, withoutindex=true)
    {
        let itm = null;
        let temp = JSON.parse(JSON.stringify(this.data));

        if (temp && temp.items && temp.items.length > 0)
        {
            temp.items.forEach((item, i) => 
            {
                if (item.id == id)
                {
                    itm = item;
                    if (!withoutindex) itm['index'] = i;
                }
                if (!itm && item.items && item.items.length > 0) 
                {
                    item.items.forEach((subItem, i2) => 
                    {
                        if (subItem.id == id)
                        {
                            itm = subItem;
                            if (!withoutindex)
                            {
                                itm['index']= i2;
                                itm['subindex']= i;
                            }
                        }
                    });
                }
            });
        }

        return itm;
    }
}

class StackEdit extends HTMLElement
{
    attributes = null;
    data = {};
    captionA = '';
    captionB = '';
    captionC = '';
    captionD = '';
    title = '';
    subtitle = '';
    colorField = '';
    backColorField = '';

    _stackContainer = null;
    onElementClick = null;

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
            const shadow =      this.attachShadow({ mode: 'closed' });
            this.captionA =     (this.getAttribute('caption-a')??'');
            this.captionB =     (this.getAttribute('caption-b')??'');
            this.captionC =     (this.getAttribute('caption-c')??'');
            this.captionD =     (this.getAttribute('caption-d')??'');
            this.title =        (this.getAttribute('title')??'');
            this.subtitle =     (this.getAttribute('subtitle')??'');
            this.colorField =   (this.getAttribute('color-field')??'#000');
            this.backColorField = (this.getAttribute('backcolor-field')??'#FFF');

            this._stackContainer = this._createFullElement('div', { id:'_stackContainer' });

            shadow.innerHTML = `
                <style>
                    *{ box-sizing: border-box;margin:0;padding:0; }
                    .d-flex{ display:flex; }
                    .flex-column{ flex-direction: column; }
                    .wrap{ flex-wrap: wrap; }
                    .gap-1{gap:4px;} .gap-2{gap:8px;}
                    .justify-content-start{ justify-content: start; } .justify-content-center{ justify-content: center; } .justify-content-end{ justify-content: end; }
                    .align-items-start{ align-items: start; } .align-items-center{ align-items: center; } .align-items-end{ align-items: end; }
                    .fz-sm{ font-size: .8rem; } .fz-normal{ font-size: 1rem; } .fz-big1{ font-size: 1.2rem; } .fz-big2{ font-size: 1.4rem; }
                    .fw-bold{ font-weight: bold; }
                    .grow-1{ flex-grow: 1; }
                    .w-100{ width: 100%; }
                    .bordered{ border: 1px solid #DDD; }
                    .noborder{ border: none !important; outline: none !important; }
                    .rounded{ border-radius: 6px; }
                    .p-1{ padding: 4px; } .p-2{ padding: 8px; } .p-3{ padding: 12px; } .p-4{ padding: 16px; } .p-5{ padding: 32px; }
                    .ps-1{ padding-left: 4px; }.ps-2{ padding-left: 8px; }.ps-3{ padding-left: 12px; }.ps-4{ padding-left: 16px; }.ps-5{ padding-left: 32px; }
                    .pe-1{ padding-right: 4px; }.pe-2{ padding-right: 8px; }.pe-3{ padding-right: 12px; }.pe-4{ padding-right: 16px; }.pe-5{ padding-right: 32px; }
                    .borderx{ border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
                    .text-secondary{ color: #888; }

                    .stack-item{ display: grid; grid-template-columns: 1.5rem 1fr; }
                    .container-item{ background-color: ${this.backColorField} !important; color: ${this.colorField} !important; outline: 1px solid #DDD; position: relative; margin-top: 1px; }
                    .mov-item{ background: transparent; color: currentColor; cursor: move; }
                    #_stackContainer{ min-height: 30vh; background-color: #F5F5F5; display: flex; flex-direction: column-reverse; }
                    .dragging{ background-color: #F0F8FF !important; transform: scale(1.02); box-shadow: 3px 3px 8px 0 #AAA; }
                    .border-t{ border-top-color: #005CC8; }
                    .border-b{ border-bottom-color: #005CC8; }
                    ` + (this.getAttribute('control-styles') ?? '') + `
                </style>
            `;

            shadow.appendChild(this._stackContainer);
            this._refreshView();

            if (this.hasAttribute('data') && this.getAttribute('data').trim())
            {
                try
                {
                    this.setData(JSON.parse(this.getAttribute('data')));
                }
                catch(error)
                {
                    alert('El valor del atributo "data" no contiene un formato JSON válido');
                    this.data = {};
                }
            }
        });
    }
    _refreshView()
    {
        this._stackContainer.innerHTML = '';
        // Items List
        if (this.data && this.data.length > 0)
        {
            this.data.forEach(item => 
            {
                let id = (item.id ?? this._generateUUID());
                this._stackContainer.appendChild(this._createRowItem(item, id));
            });
        }
    }
    _createRowItem(item, id = '')
    {
        const containerItem = this._createFullElement('div', { class:'container-item ps-1 borderx', 'item-id':`${id}` });
        const rowItem = this._createFullElement('div', { class:'stack-item' });
        const movItem = this._createFullElement('button', { class: 'noborder mov-item', draggable: 'true' });
        const rowData = this._createFullElement('div', { class:'p-2 d-flex wrap gap-2' });

        movItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>`;

        // row data
        const sectionASide = this._createFullElement('div', { id:'sectionASide', class:'fz-sm grow-1' });
        const sectionBSide = this._createFullElement('div', { id:'sectionBSide', class:'fz-sm' });
        const sectionTitle = this._createFullElement('div', { id:'sectionTitle', class:'w-100 fw-bold fz-normal'});
        const sectionSubtl = this._createFullElement('div', { id:'sectionSubtl', class:'w-100 fz-normal'});
        const sectionCSide = this._createFullElement('div', { id:'sectionCSide', class:'fz-sm grow-1' });
        const sectionDSide = this._createFullElement('div', { id:'sectionDSide', class:'fz-sm' });

        const headItemSect = this._createFullElement('div', { id:'headItemSect', class:'w-100 d-flex align-items-center'});
        const bodyItemSect = this._createFullElement('div', { id:'bodyItemSect', class:'w-100 d-flex align-items-center wrap' });
        const footItemSect = this._createFullElement('div', { id:'footItemSect', class:'w-100 d-flex align-items-center'});

        sectionASide.textContent = (item?.[this.captionA]??'');
        sectionBSide.textContent = (item?.[this.captionB]??'');
        sectionTitle.textContent = (item?.[this.title]??'');
        sectionSubtl.textContent = (item?.[this.subtitle]??'');
        sectionCSide.textContent = (item?.[this.captionC]??'');
        sectionDSide.textContent = (item?.[this.captionD]??'');

        headItemSect.appendChild(sectionASide);
        headItemSect.appendChild(sectionBSide);
        bodyItemSect.appendChild(sectionTitle);
        bodyItemSect.appendChild(sectionSubtl);
        footItemSect.appendChild(sectionCSide);
        footItemSect.appendChild(sectionDSide);

        rowData.appendChild(headItemSect);
        rowData.appendChild(bodyItemSect);
        rowData.appendChild(footItemSect);

        rowItem.appendChild(movItem);
        rowItem.appendChild(rowData);

        containerItem.appendChild(rowItem);

        containerItem.addEventListener('click', () => {
            let item = this._getItem(containerItem.getAttribute('item-id'), false);
            let index = item.index;
            delete item.index;
            delete item.id;
            if (this.onElementClick)
                this.onElementClick(item, index);
        });

        containerItem.addEventListener('dragstart', (e) => {
            this._draggingItem = containerItem;
            e.dataTransfer.setData('text/plain', containerItem.getAttribute('item-id'));
            containerItem.classList.add('dragging');
        });
        containerItem.addEventListener('dragend', () => {
            containerItem.classList.remove('dragging');
            this._draggingItem = null;
        })
        containerItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this._draggingItem && containerItem.getAttribute('item-id') == this._draggingItem.getAttribute('item-id')) return;
            const rect = containerItem.getBoundingClientRect();
            const limity = (rect.y + (rect.height / 2));

            let y = (e.clientY < limity);

            containerItem.classList.toggle('border-b', !y);
            containerItem.classList.toggle('border-t', y);

            this._topPositionDragEvent = y;
        });
        containerItem.addEventListener('dragleave', (e) => {
            containerItem.classList.remove('border-b');
            containerItem.classList.remove('border-t');
        });
        containerItem.addEventListener('drop', (e) => {
            e.preventDefault();
            containerItem.classList.remove('border-b');
            containerItem.classList.remove('border-t');

            if (this._draggingItem && containerItem.getAttribute('item-id') == this._draggingItem.getAttribute('item-id')) return;

            if (this._draggingItem)
            {
                this._draggingItem.classList.remove('dragging');

                let index = 0;
                let sourceItem = this._getItem(this._draggingItem.getAttribute('item-id'), false);
                
                if (sourceItem)
                    this.data.splice(sourceItem.index, 1);

                let targetItem = this._getItem(containerItem.getAttribute('item-id'), false);
                
                if (this._topPositionDragEvent)
                    index = 1;
                
                if (targetItem)
                {
                    index += targetItem.index;
                    delete sourceItem.index;
                    this.data.splice(index, 0, sourceItem);
                }
            }
            this._refreshView();
        });

        if ((this.getAttribute('styles-field')??'') != '')
            containerItem.setAttribute('style', (item[this.getAttribute('styles-field')]??''));

        return containerItem;
    }
    setData(obj)
    {
        this.data = obj;
        if (this.data && this.data.length > 0)
        {
            this.data.forEach(item => {
                item['id'] = (item.id ?? this._generateUUID());
            });
        }
        this._refreshView();
    }
    getData()
    {
        const copy = JSON.parse(JSON.stringify(this.data))
        
        if (copy && copy.length > 0)
            copy.forEach(item => {
                delete item.id;
                delete item.index;
            });
        
        return copy;
    }
    _createFullElement(tagName="div", attributes={})
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    _generateUUID()
    {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, 
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    _getItem(id, withoutindex=true)
    {
        let itm = null;
        let temp = JSON.parse(JSON.stringify(this.data));
        
        if (temp && temp.length > 0)
        {
            temp.forEach((item, i) => 
            {
                if (item.id == id)
                {
                    itm = item;
                    if (!withoutindex) itm['index'] = i;
                }
            });
        }
        
        return itm;
    }
}

class DateRange extends HTMLElement
{
    attributes = null;
    data = {};
    onChange = null;

    _iptStr = null;
    _iptEnd = null;
    _hiddenInputStr = null;
    _hiddenInputEnd = null;

    constructor() 
    {
        super();
        document.addEventListener('DOMContentLoaded', () => this.attributes = this.getAttributeNames());
    }

    static get observedAttributes()
    {
        return  attributes;
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
            const shadow = this.attachShadow({ mode: 'closed' });
            const contnr = this._createFullElement('div', { id:'DateRange_contnr', class:'w-100 d-flex gap-2 align-items-center justify-content-center'});
            
            const cntnr1 = this._createFullElement('div', { id:'DateRange_cntnr1', class:'w-100 d-flex wrap' });
            const lblStr = this._createFullElement('span', { id:'DateRange_lblStr', class:'induxsoft-form-label text-secondary'});
            this._iptStr = this._createFullElement('input', { type:'date', id:'DateRange_iptStr', class:'induxsoft-form-control' });
            lblStr.textContent = 'Fecha inicial:';
            cntnr1.appendChild(lblStr);
            cntnr1.appendChild(this._iptStr);
            contnr.appendChild(cntnr1);

            const cntnr2 = this._createFullElement('div', { id:'DateRange_cntnr2', class:'w-100 d-flex wrap' });
            const lblEnd = this._createFullElement('span', { id:'DateRange_lblEnd', class:'induxsoft-form-label text-secondary'});
            this._iptEnd = this._createFullElement('input', { type:'date', id:'DateRange_iptEnd', class:'induxsoft-form-control' });
            lblEnd.textContent = 'Fecha final:';
            cntnr2.appendChild(lblEnd);
            cntnr2.appendChild(this._iptEnd);
            contnr.appendChild(cntnr2);

            this._iptStr.toggleAttribute('disabled', ((this.getAttribute('disabled')??'') === 'true'));
            this._iptEnd.toggleAttribute('disabled', ((this.getAttribute('disabled')??'') === 'true'));

            this._iptStr.addEventListener('change', () => {
                this.data.start = this._iptStr.value;
                this._refreshDates();
            });
            this._iptEnd.addEventListener('change', () => {
                this.data.end = this._iptEnd.value;
                this._refreshDates();
            });

            const MO = new MutationObserver(()=>{
                this._iptStr.toggleAttribute('disabled', ((this.getAttribute('disabled')??'') === 'true'));
                this._iptEnd.toggleAttribute('disabled', ((this.getAttribute('disabled')??'') === 'true'));
            });

            MO.observe(this, {
                attributes: true,
                attributeFilter: ['disabled']
            });

            shadow.innerHTML = `
                <style>
                    *{ box-sizing: border-box;margin:0;padding:0; }
                    .d-flex{ display:flex; }
                    .wrap{ flex-wrap: wrap; }
                    .gap-1{gap:4px;} .gap-2{gap:8px;}
                    .justify-content-start{ justify-content: start; } .justify-content-center{ justify-content: center; } .justify-content-end{ justify-content: end; }
                    .align-items-start{ align-items: start; } .align-items-center{ align-items: center; } .align-items-end{ align-items: end; }
                    .grow-1{ flex-grow: 1; }
                    .w-100{ width: 100%; }
                    .text-secondary{ color: #888; }

                    .induxsoft-form-control{ border: none; outline: 1px solid #ced4da; display: block; width: 100%; padding: 0.375rem 0.75rem !important; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; background-color: #fff; background-clip: padding-box; appearance: none; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
                    .induxsoft-form-control:disabled, .induxsoft-form-control[readonly] { background-color: #e9ecef; opacity: 1; }
                    .induxsoft-form-label{ margin-bottom: 0.5rem; }
                </style>
            `

            if (this.hasAttribute('data') && this.getAttribute('data').trim() != '')
            {
                try {
                    this.data = JSON.parse(this.getAttribute('data'));
                }
                catch(error) {
                    alert('El valor del atributo "data" no contiene un formato JSON válido');
                    this.data = {};
                }
            }

            if (this.hasAttribute('start') && this.getAttribute('start').trim() != '')
                this.data.start = this.getAttribute('start').trim();
            if (this.hasAttribute('end') && this.getAttribute('end').trim() != '')
                this.data.end = this.getAttribute('end').trim();

            if (this.hasAttribute('hidden-input-name-end') && this.getAttribute('hidden-input-name-end').trim() != '')
            {
                this._hiddenInputEnd = this._createFullElement('input', { type:'hidden', name:this.getAttribute('hidden-input-name-end').trim() });
                this.after(this._hiddenInputEnd);
            }
            if (this.hasAttribute('hidden-input-name-start') && this.getAttribute('hidden-input-name-start').trim() != '')
            {
                this._hiddenInputStr = this._createFullElement('input', { type:'hidden', name:this.getAttribute('hidden-input-name-start').trim() });
                this.after(this._hiddenInputStr);
            }

            shadow.appendChild(contnr);
            this._refreshDates();
        });
    }

    /**
     * @param {string} tagName Nombre de etiqueta.
     * @param {object} attributes Objeto que representan los atributos del elemento, ej: {id:'miElement',class:'mi-element'}
     * @returns Retorna un **nuevo elemento HTML**
     */
    _createFullElement(tagName="div", attributes={})
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    _refreshDates=()=>
    {
        if (this.data && Object.entries(this.data).length > 0)
        {
            this._iptStr.value = (this.data.start ?? '');
            this._iptEnd.value = (this.data.end ?? '');
            if (this._hiddenInputStr) this._hiddenInputStr.value = (this.data.start ?? '');
            if (this._hiddenInputEnd) this._hiddenInputEnd.value = (this.data.end ?? '');
        }
        else
        {
            this._iptStr.value = '';
            this._iptEnd.value = '';
            if (this._hiddenInputStr) this._hiddenInputStr.value = '';
            if (this._hiddenInputEnd) this._hiddenInputEnd.value = '';
        }

        if (this.onChange) this.onChange(this.data);
    }
    setData=(obj)=>
    {
        this.data = obj;
        this._refreshDates();
    }
    getData=()=>
    {
        return this.data;
    }
}

class SafeInput extends HTMLElement
{
    attributes = null;
    _inputTypes = ['text','email','number','textarea','date','time','datetime','select'];
    _tempValue = '';
    
    _inputSf = null;
    _inputHd = null;
    _btnEdit = null;
    _btnDone = null;
    _btnUndo = null;

    onChanging = null;

    constructor() 
    {
        super();
        document.addEventListener('DOMContentLoaded', () => this.attributes = this.getAttributeNames());
    }

    static get observedAttributes()
    {
        return  attributes;
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
            const shadow = this.attachShadow({ mode: 'closed' });
            
            const contanr = this._createFullElement('div', { id:'SafeInput_contnr', class:'d-flex justify-content-center' });
            this._btnEdit = this._createFullElement('button', { id:'SafeInput_btnEdit', title:'Edit', class:'induxsoft-buttons d-flex justify-content-center align-items-center' });
            this._btnDone = this._createFullElement('button', { id:'SafeInput_btnDone', title:'Save', class:'d-none induxsoft-buttons d-flex justify-content-center align-items-center' });
            this._btnUndo = this._createFullElement('button', { id:'SafeInput_btnUndo', title:'Cancel', class:'d-none induxsoft-buttons d-flex justify-content-center align-items-center' });
            this._inputSf = this._getProcessInput();

            this._btnEdit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`;
            this._btnDone.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>`;
            this._btnUndo.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`;
            this._btnEdit.classList.toggle('disable-element', ((this.getAttribute('disabled')??'') === 'true'));
            this._inputSf.setAttribute('disabled','true');

            this._btnEdit.addEventListener('click', () => {
                this._startEdit();
                this._showControlButtons(true);
            });
            this._inputSf.addEventListener('keydown', (e) => {
                if (e.key === 'Enter')
                    this._confirmEdit(contanr);    
            });
            this._btnDone.addEventListener('click', async () => {
                this._confirmEdit(contanr);
            });
            this._btnUndo.addEventListener('click', () => {
                this._cancelEdit();
                this._showControlButtons(false);
            });

            const MO = new MutationObserver(()=>{
                this._btnEdit.classList.toggle('disable-element', ((this.getAttribute('disabled')??'') === 'true'));
            });

            MO.observe(this, {
                attributes: true,
                attributeFilter: ['disabled']
            });

            shadow.innerHTML = `
                <style>
                    *{ box-sizing: border-box;margin:0;padding:0; }
                    .d-flex{ display:flex; } .d-none{ display: none !important; }
                    .wrap{ flex-wrap: wrap; }
                    .gap-1{gap:4px;} .gap-2{gap:8px;}
                    .justify-content-start{ justify-content: start; } .justify-content-center{ justify-content: center; } .justify-content-end{ justify-content: end; }
                    .align-items-start{ align-items: start; } .align-items-center{ align-items: center; } .align-items-end{ align-items: end; }
                    .grow-1{ flex-grow: 1; }
                    .w-100{ width: 100%; }
                    .text-secondary{ color: #888; }
                    .disable-element{ pointer-events: none; background-color: #e9ecef !important; opacity: 1;}
                    .waiting{ pointer-events: none; opacity: .5; cursor: progress; }

                    .induxsoft-form-control{ border: none; outline: 1px solid #ced4da; display: block; width: 100%; padding: 0.375rem 0.75rem !important; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; background-color: #fff; background-clip: padding-box; appearance: none; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
                    .induxsoft-form-control:disabled, .induxsoft-form-control[readonly] { background-color: #e9ecef; opacity: 1; }
                    .induxsoft-form-label{ margin-bottom: 0.5rem; }
                    .induxsoft-form-select{ display: block;width: 100%;padding: 0.375rem 2.25rem 0.375rem 0.75rem !important;-moz-padding-start: calc(0.75rem - 3px);font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;background-color: #fff;background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");background-repeat: no-repeat;background-position: right 0.75rem center;background-size: 16px 12px;border: none;outline: 1px solid #ced4da;-webkit-appearance: none;-moz-appearance: none;appearance: none; }
                    .induxsoft-form-select:disabled, .induxsoft-form-select[readonly] { background-color: #e9ecef; opacity: 1; }
                    .induxsoft-buttons{ font-weight: 400;line-height: 1.5;color: #212529;text-align: center;text-decoration: none;vertical-align: middle;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;user-select: none;background-color: #FFF;outline:1px solid #ced4da;border: none;padding: 0.375rem 0.75rem;font-size: 1rem;transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
                    .induxsoft-buttons:hover{ color: #212529;background-color: #F5F5F5; }

                    ` + (this.getAttribute('control-styles') ?? '') + `
                </style>
            `

            contanr.appendChild(this._inputSf);
            contanr.appendChild(this._btnEdit);
            contanr.appendChild(this._btnDone);
            contanr.appendChild(this._btnUndo);

            shadow.appendChild(contanr);
        });
    }
    /**
     * @param {string} tagName Nombre de etiqueta.
     * @param {object} attributes Objeto que representan los atributos del elemento, ej: {id:'miElement',class:'mi-element'}
     * @returns Retorna un **nuevo elemento HTML**
     */
    _createFullElement(tagName="div", attributes={})
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    _getProcessInput=()=>
    {
        let attrType = (this.hasAttribute('type') ? this.getAttribute('type').trim().toLocaleLowerCase() : 'text');
        let inputType = (this._inputTypes.find(type => type == attrType) ?? 'text');

        let input = null;

        switch(inputType)
        {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
            case 'time':
            {
                input = this._createFullElement('input', { type: inputType, class:'induxsoft-form-control' });
                break;
            }
            case 'datetime':
            {
                input = this._createFullElement('input', { type: 'datetime-local', class:'induxsoft-form-control' });
                break;
            }
            case 'select':
            {
                input = this._createFullElement(inputType, { class:'induxsoft-form-select' });

                if (this.hasAttribute('data-select') && this.getAttribute('data-select').trim() != '')
                {
                    let options = {};

                    try{ options = JSON.parse(this.getAttribute('data-select').trim()); }
                    catch(error){ alert('El valor del atributo "data" no contiene un formato JSON válido\n'+error); }

                    Object.keys(options).forEach(key => {
                        let option = this._createFullElement('option', { value:key });
                        option.textContent = options[key];
                        input.appendChild(option);
                    });
                }
                break;
            }
            default:
            {
                input = this._createFullElement(inputType, { class:'induxsoft-form-control' });
                break;
            }
        }

        if (this.getAttribute('placeholder'))
            input.setAttribute('placeholder', this.getAttribute('placeholder'));

        if (input) input.value = (this.getAttribute('value') ?? '');

        if (this._parseBool(this.getAttribute('hidden-input')))
        {
            this._inputHd = this._createFullElement('input', { type:'hidden', id:'SafeInput_inputHd', name:(this.getAttribute('input-name') ?? '') });
            this._inputHd.value = input.value;
            this.after(this._inputHd);
        }

        return input;
    }
    _showControlButtons=(edit=false)=>
    {
        this._btnEdit.classList.toggle('d-none', edit );
        this._btnDone.classList.toggle('d-none', !edit);
        this._btnUndo.classList.toggle('d-none', !edit);
        this._inputSf.toggleAttribute('disabled', !edit);
    }
    _startEdit=()=>
    {
        this._tempValue = (this._inputSf?.value ?? '');
    }
    _confirmEdit=async(contanr)=>
    {
        contanr.classList.add('waiting');
        this.style.cursor = 'progress';
        let res = await this._cancelChange();
        if (res) {
            this._cancelEdit();
        }
        else {
            this._showControlButtons(false);
            if (this._inputHd) this._inputHd.value = this._inputSf.value;
        }
        contanr.classList.remove('waiting');
        this.style.cursor = 'initial';
    }
    _cancelEdit=()=>
    {
        if (this._inputSf) this._inputSf.value = this._tempValue;
        if (this._inputHd) this._inputHd.value = this._tempValue;
    }
    _cancelChange=async()=>
    {
        return new Promise(resolve => {
            if (this.onChanging) 
                resolve(this.onChanging(this._tempValue, this._inputSf.value));
            else
                resolve(false);
        });
    }
    _parseBool=(value, _default = false)=>
    {
        if (value) return (value.toString().toLowerCase() === 'true');
        return _default;
    }
}

class MediaList extends HTMLElement
{
    attributes = null;
    data = [];
    contanr = null;
    dragSrc = null;
    _key_id = '__internal_id__';

    canArrange = true;
    canDrag = true;
    canDrop = true;
    canDelete = true;
    highlightFirst = true;
    mediaProp = 'url';
    miniatureProp = 'mini';
    removeOnMove = true;
    backColorMedia = '#FFF';
    outlineSelected = false;
    maxSizeMedia = '8rem';
    onClicking = null;

    constructor() 
    {
        super();
        document.addEventListener('DOMContentLoaded', () => this.attributes = this.getAttributeNames());
    }
    static get observedAttributes()
    {
        return  attributes;
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
            const shadow = this.attachShadow({ mode: 'closed' });
            const ppanel = this._createFullElement('div', { id:'MediaList_ppanel', class: 'p-1 bordered' });
            this.contanr = this._createFullElement('div', { id:'MediaList_contnr' });

            this._initProperties();
            
            shadow.innerHTML = `
                <style>
                    .bordered{ outline: 1px solid #DDD; }
                    .w-100{ width: 100%; } .h-100{ height: 100%; }
                    .p-1{ padding: 4px; } .p-2{ padding: 8px; } .p-3{ padding: 12px; } .p-4{ padding: 16px; } .p-5{ padding: 32px; }
                    .ps-1{ padding-left: 4px; }.ps-2{ padding-left: 8px; }.ps-3{ padding-left: 12px; }.ps-4{ padding-left: 16px; }.ps-5{ padding-left: 32px; }
                    .pe-1{ padding-right: 4px; }.pe-2{ padding-right: 8px; }.pe-3{ padding-right: 12px; }.pe-4{ padding-right: 16px; }.pe-5{ padding-right: 32px; }
                    
                    #MediaList_contnr { width: 100%; min-width: 1rem; min-height: 5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(1rem, ${this.maxSizeMedia})); grid-auto-rows: minmax(1rem, ${this.maxSizeMedia}); }
                    .media-item { border: 8px solid transparent; transition: .5s; position:relative; position: relative; }
                    .dragging { border: 24px solid transparent; }
                    .dragging .img { box-shadow: 4px 4px 8px 0 #DDD !important; }
                    .btn-delete { cursor:pointer; position:absolute; background-color: #FFF; opacity: .3; bottom: 8px; right: 8px; display:flex; align-items:center; }
                    .btn-delete:hover { opacity: 1; }
                    .border-l { border-left: 24px solid transparent !important; border-top: 24px solid transparent !important; }
                    .border-r { border-right: 24px solid transparent !important; border-bottom: 24px solid transparent !important; }
                    .highlight { border-color: #E2F2FF; }
                    .drag-container { background-color: #F5F5F5; border: 1px dashed; }
                    .img{ background-repeat: no-repeat; background-size: contain; background-position: center; background-color: #FFF; }
                    .draggable-item { cursor: move; }
                    .outline-element { outline: 2px solid #000 !important; }
                </style>
            `;

            ppanel.appendChild(this.contanr);
            shadow.appendChild(ppanel);

            if (this.hasAttribute('data') && this.getAttribute('data').trim()) 
            {
                try {
                    this.setData(JSON.parse(this.getAttribute('data'))); }
                catch(error) {
                    alert('El valor del atributo "data" no contiene un formato JSON válido');
                    this.data = [];
                }
            }

            this._refreshView();
        });
    }

    // Internal Functions
    _refreshView(preserveElements=false)
    {
        if (preserveElements) this.data = this.getData(false);
        this.contanr.innerHTML = '';

        if (this.data && this.data.length > 0)
        {
            this.data.forEach(item => this.contanr.appendChild(this._createMediaItem(item)));
        }
        this._setItemEvents();

        if (this.highlightFirst && this.contanr.firstChild)
            this.contanr.firstChild.classList.add('highlight');
        
    }
    _createMediaItem(item)
    {
        item[this._key_id] = (item[this._key_id] ?? this._generateUUID());
        const imgi = this._createFullElement('div', { class:'w-100 h-100 img bordered'});

        const container = this._createFullElement('div', { class:'media-item', draggable:'true', data: JSON.stringify(item), id: item[this._key_id] });
        container.appendChild(imgi);

        if (this.canDelete)
        {
            let btnDelete = this._createFullElement('div', { class:'p-1 btn-delete', title:'Eliminar' });
            btnDelete.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg>';
            imgi.appendChild(btnDelete);
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                this.contanr.removeChild(container);
            });
        }

        let img = '';
        if (item[this.miniatureProp])
            img = (item[this.miniatureProp] ?? '');
        if (img.trim() == '')
            img = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="lightgray" class="bi bi-image-alt" viewBox="0 0 16 15"><path d="M7 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm4.225 4.053a.5.5 0 0 0-.577.093l-3.71 4.71-2.66-2.772a.5.5 0 0 0-.63.062L.002 13v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5l-4.777-3.947z"/></svg>';

        imgi.style.backgroundImage = `url('${img}')`;
        imgi.style.backgroundColor = this.backColorMedia;

        return container;
    }
    _initProperties()
    {
        this.canArrange = this._parseBool((this.getAttribute('can-arrange') ?? 'true'), true);
        this.canDrag = this._parseBool((this.getAttribute('can-drag') ?? 'true'), true);
        this.canDrop = this._parseBool((this.getAttribute('can-drop') ?? 'true'), true);
        this.canDelete = this._parseBool((this.getAttribute('can-delete') ?? 'true'), true);
        this.highlightFirst = this._parseBool((this.getAttribute('highlight-first') ?? 'true'), true);
        this.mediaProp = (this.getAttribute('media-prop') ?? 'url');
        this.miniatureProp = (this.getAttribute('miniature-prop') ?? 'mini');
        this.backColorMedia = (this.getAttribute('back-color-media') ?? '#FFF');
        this.outlineSelected = this._parseBool((this.getAttribute('outline-selected') ?? 'false'), false);
        let maxsize = (this.getAttribute('max-size-media') ?? '');
        this.maxSizeMedia = (maxsize.trim() != '' ? maxsize.trim() : '8rem');
    }
    _setItemEvents()
    {
        let _XPositionDragEvent = 0;
        const getTarget = (e) =>
        {
            let target = e.currentTarget;
            if (!e.target.classList.contains('media-item'))
                target = e.target.closest('.media-item');
            return target;
        }
        const handleClick = (e) =>
        {
            e.stopPropagation();
            let target = getTarget(e);
            this.contanr.querySelectorAll('.media-item').forEach(item => {
                item.firstChild.classList.remove('outline-element');
            });
            if (this.outlineSelected) target.firstChild.classList.add('outline-element');
            if (this.onClicking) this.onClicking(JSON.parse(target.getAttribute('data')));
        }
        const handleDragStart = (e) => 
        {
            e.stopPropagation();

            let target = getTarget(e);
            target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', target.getAttribute('data'));
        }
        const handleDragOver = (e) => 
        {
            e.stopPropagation();
            e.preventDefault();

            let target = getTarget(e);
            const rect = target.getBoundingClientRect();
            const limitx = (rect.x + (rect.width / 2));

            let x = (e.clientX > limitx);
            _XPositionDragEvent = x;

            target.classList.toggle('border-l', !x);
            target.classList.toggle('border-r', x);
        }
        const handleDragEnter = (e) => 
        {
            e.stopPropagation();
            let target = getTarget(e);
            target.classList.add('over');
        }
        const handleDragLeave = (e) => 
        {
            e.stopPropagation();
            let target = getTarget(e);
            target.classList.remove('border-l');
            target.classList.remove('border-r');
        }
        const handleDragEnd = (e) => 
        {
            e.stopPropagation();
            let target = getTarget(e);
            target.classList.remove('dragging');
            target.classList.remove('border-l');
            target.classList.remove('border-r');
            // if (this.removeOnMove)
            //     target.remove();
        }

        const handleDrop = (e,dropInItem=true) => 
        {
            e.stopPropagation();
            
            let itemData = null;
            let jsonData = e.dataTransfer.getData('application/json')
            try { itemData = JSON.parse(jsonData); }
            catch(error) { console.log(jsonData); }

            let target = e.target;
            if (dropInItem){
                target = getTarget(e);
            }
            
            target.classList.remove('dragging');
            target.classList.remove('border-l');
            target.classList.remove('border-r');
            target.classList.remove('drag-container');

            if (itemData)
            {
                // Obtenemos el item soltado si existe
                let item = null;
                this.contanr.querySelectorAll('.media-item').forEach(itm => { if (itm.id == itemData[this._key_id]) item = itm; });

                // Si no existe lo creamos
                if (!item){
                    item = this._createMediaItem(itemData);
                    setEvents(item);
                }
                else if(!this.canArrange)
                {
                    // Detenemos la operación para ordenación de items existentes
                    return false;
                }

                // Agregamos el item al lado del overItem o como hijo si es el contenedor principal
                if (dropInItem)
                {
                    if (_XPositionDragEvent) target.after(item);
                    else target.before(item);
                }
                else
                {
                    target.appendChild(item);
                }

                if (this.highlightFirst)
                {
                    this.contanr.childNodes.forEach(item => item.classList.remove('highlight'));
                    this.contanr.firstChild.classList.add('highlight');
                }
            }
            return false;
        }

        const dropItem = (e) => { handleDrop(e,true) };
        const dropMain = (e) => { handleDrop(e,false) };

        const setEvents = (item) => 
        {
            item.ondragstart =  (this.canDrag ? handleDragStart : null);
            item.ondragover =  (this.canDrop ? handleDragOver: null);
            item.ondragenter =  (this.canDrop ? handleDragEnter: null);
            item.ondragleave =  handleDragLeave;
            item.ondragend =  handleDragEnd;
            item.ondrop =  (this.canDrop ? dropItem : null);
            item.onclick = handleClick;

            item.classList.toggle('draggable-item', this.canDrag);
        }

        this.contanr.querySelectorAll('.media-item').forEach(item => {
            setEvents(item);
        });

        // Container
        const handleDragOverCntainr  = (e) => 
        {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        const handleDragEnterCntainr = (e) => 
        {
            e.stopPropagation();
            e.target.classList.add('drag-container');
        }
        const handleDragLeaveCntainr = (e) =>
        {
            e.stopPropagation();
            e.target.classList.remove('drag-container');
        }

        this.contanr.ondragover = (this.canDrop ? handleDragOverCntainr : null);
        this.contanr.ondragenter = (this.canDrop ? handleDragEnterCntainr : null);
        this.contanr.ondragleave = handleDragLeaveCntainr;
        this.contanr.ondrop = (this.canDrop ? dropMain : null);
    }

    // Public Functions
    setData(data)
    {
        this.data = data;
        if (this.data && this.data.length > 0) 
            this.data.forEach(item => item[this._key_id] = (item[this._key_id] ?? this._generateUUID()));
        this._refreshView();
    }
    getData(withoutid=true)
    {
        let data = [];
        this.contanr.querySelectorAll('.media-item').forEach(element => data.push(JSON.parse(element.getAttribute('data'))));
        if (withoutid) data.forEach(item => delete item[this._key_id]);
        return data;
    }
    addMedia(mediaData)
    {
        try
        {
            let itemData = (typeof(mediaData) == 'object' ? mediaData : JSON.parse(mediaData) );
            this.contanr.appendChild(this._createMediaItem(itemData));
            this._setItemEvents();
        }
        catch(error)
        {
            alert('No fué posible agregar el elemento, revise que los datos tengan un formato JSON válido\n\n');
        }
    }
    removeMediaByIndex(index)
    {
        let items = this.contanr.querySelectorAll('.media-item');
        
        if (index <= items.length-1) {
            items.forEach((item,i) => {
                if (i == index) this.contanr.removeChild(item);
            });
        }
    }
    refreshView()
    {
        this._refreshView(true);
    }

    // Util Functions
    /**
     * @param {string} tagName Nombre de etiqueta.
     * @param {object} attributes Objeto que representan los atributos del elemento, ej: {id:'miElement',class:'mi-element'}
     * @returns Retorna un **nuevo elemento HTML**
     */
    _createFullElement(tagName="div", attributes={})
    {
        const elem = document.createElement(tagName);
        const keys = Object.keys(attributes);
        keys.forEach(key => elem.setAttribute(key, attributes[key]));
        return elem;
    }
    _parseBool=(value, _default = false)=>
    {
        if (value) return (value.toString().toLowerCase() === 'true');
        return _default;
    }
    _generateUUID()
    {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, 
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

customElements.define('edit-select', EditSelect);
customElements.define('input-key', InputKey);
customElements.define('check-list', CheckList);
customElements.define('stack-edit', StackEdit);
customElements.define('date-range', DateRange);
customElements.define('safe-input', SafeInput);
customElements.define('media-list', MediaList);