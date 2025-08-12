document.addEventListener("DOMContentLoaded",
()=>
{
    ops.init();
});

var ops=
{
    init()
    {
        this.ref_gasto=document.getElementById("ref_gasto");
        this.form_search=document.getElementById("form_search");
        this.table_movs=document.getElementById("table_movs");
        this.txt_gop_mov=document.getElementById("txt_gop_mov");
        this.txt_ref_gasto=document.getElementById("txt_ref_gasto");
        this.dte=document.getElementById("dte");
        this.ejercicio=document.getElementById("ejercicio");
        this.txt_ejercicio=document.getElementById("txt_ejercicio");

        this.ik_unidad_org=document.getElementById("ik_unidad_org");
        this.ik_partida_pre=document.getElementById("ik_partida_pre");

        this.count_search=0;
        if(this.ref_gasto)this.ref_gasto.addEventListener("change", (data) => {
            if (!data) return;

            if(ops.count_search>0)if(this.form_search)this.form_search.submit();
            ops.count_search++;
        });
        
        if(this.ejercicio)this.ejercicio.addEventListener("change",
        ()=>
        {
            ops.changeDataSource(ops.getCurrentRow());
            if(this.txt_ejercicio && this.form_search)
            {
                this.txt_ejercicio.value=this.ejercicio.value;
                this.form_search.submit()
            }
        });

        setTimeout(() => {
            if(this.table_movs && this.ik_unidad_org && this.ik_partida_pre)
            {
                this.table_movs.setInputKey("uorg",this.ik_unidad_org);
                this.table_movs.setInputKey("partida",this.ik_partida_pre);

                this.ik_unidad_org.addEventListener('change', ()=>
                {
                    var data=ops.ik_unidad_org.getValue();
                    ops.setFieldsTable(data);
                });
                this.ik_partida_pre.addEventListener("change",
                ()=>
                {
                    var data=ops.ik_partida_pre.getValue();
                    ops.setFieldsTable(data,true);
                });

                ops.setTableEvents();
            } 
        }, 300);
        
    },
    setTableEvents()
    {
       
        if (this.table_movs)
        {
            const T = this.table_movs;
            const E = T.EdiTable.Const.Events;
            T.Events[E.FieldUpdated] = (e) => { }
            T.Events[E.BeforeUpdateCell] = (e) => { }
            T.Events[E.EnterCell] = (e) => 
            { 
                ops.changeDataSource(ops.getCurrentRow());
            }
        }
    },
    changeDataSource(row)
    {
        var url_partida=ops.url_partida + "&type=single&unidad="+(row.pkuorg??"")+"&ejercicio="+this.ejercicio.value;
        if(this.ik_partida_pre)this.ik_partida_pre.setAttribute("data-source",url_partida);
    },
    getCurrentRow()
    {
        var index=this.table_movs.CurrentRowIndex();
        var row=this.table_movs.DataArray[index];
        
        if(!row)row={};
        
        row["_index_"]=index;

        return row;
    },
    setFieldsTable(data,ispartida=false)
    {
        var row=ops.getCurrentRow();
        if(ispartida)
        {
            row["partida"]=data.partida??"";
            row["pkpartida"]=data.sys_pk??0;
            row["divisa"]=(data.divisa??"") + " (TC: $ "+(data.tcambio??1)+")" ;
        }
        else
        {
            row["uorg"]=data.descripcion??"";
            row["pkuorg"]=data.sys_pk??0;

            this.changeDataSource(row);
        }
        
        this.table_movs.DataArray[row["_index_"]]=row;
        this.table_movs._printRows();
    },
    AddRow()
    {
        if(this.table_movs)this.table_movs.AddRow();
    },
    validateTable()
    {
        let added_rows = this.table_movs.DataArray.length;
        if (added_rows == 0) {
            alert("Debe agregar al menos una fila a la tabla.");
            return false;
        }
        let valid_rows = 0;
        let ok = true;

        for (let i = 0; i < added_rows; i++) 
        {
            let itm = this.table_movs.DataArray[i];
            let row=i+1;

            let comprometido = Number(itm.comprometido);
            let ejercido = Number(itm.ejercido);

            if (!itm.uorg && !itm.partida && (comprometido + ejercido) <= 0) {
                continue;
            }
            valid_rows++;

            if((itm.pkuorg??0)<1 || ((itm.pkpartida??0)<1)) 
            {
                alert(`Debe completar la fila ${row}`);
                ok = false;
                break;
            }
            if((itm.periodo??0)<1) 
            {
                alert(`Fila ${row} le falta definir el periodo`);
                ok = false;
                break;
            }
            if((comprometido + ejercido) <= 0)
            {
                alert(`Fila ${row} le falta definir la cantidad comprometido o ejercido`);
                ok = false;
                break;
            }
        }

        if (valid_rows == 0) {
            alert("Debe completar al menos una fila de la tabla.");
            ok = false
        }

        return ok;
    },
    form_gop_mov()
    {
        if (!ops.validateTable()) return false;

        var ref_gasto=this.ref_gasto?.getValue()??null;
        if(!ref_gasto || Object.keys(ref_gasto).length<1)
        {
            alert("Debe seleccionar el Ref. del gasto");
            return false;
        }
        ref_gasto["dte"]=this.dte.value;
        ref_gasto["ejercicio"]=this.ejercicio.value;
        
        let movs = this.table_movs.DataArray.filter(row => (row.uorg && row.partida && (Number(row.comprometido)+Number(row.ejercido)) > 0));

        if(this.txt_gop_mov)this.txt_gop_mov.value=JSON.stringify(movs);
        if(this.txt_ref_gasto)this.txt_ref_gasto.value=JSON.stringify(ref_gasto);
        
        return true;
    },
    DelRow()
    {
        if(!this.table_movs)return;
        var index=this.table_movs.CurrentRowIndex();

        if(index<0)
        {
            alert("Debe seleccionar un elemento de la tabla");
            return;
        }

        var row=this.table_movs.DataArray[index];
        if((row?.sys_pk??0)>0)
        {
            if(!confirm("¿Esta seguro de eliminar la fila?"))return;
            
            let id=row.sys_pk;
            var data={sys_pk:id}
            var url=".";
            
            var success=(data)=>
            {
                this.table_movs.DeleteCurrentRow();
            }
            this.service(url,data,"delete_partida",success);
            return;
        }
        else
            this.table_movs.DeleteCurrentRow();
    },
    descartar(id,params="")
    {
        var r=confirm("¿Esta seguro de descartar?");
        if(!r)return;
        
        var data={sys_pk:id}
        var url=ops.url_descartar.replace("{id}",id);
        if(params.trim()!="")url=url.includes("?")?"&":"?"+params;
        url=url + "?dte="+this.dte.value;

        this.service(url,data,"descartar");
    },
    Back(id,actback="back_for_affect",params="")
    {
        var data={sys_pk:id}
        var url=ops.url_descartar.replace("{id}",id);
        if(params.trim()!="")url=url.includes("?")?"&":"?"+params;
        url=url + "?dte="+this.dte.value;

        this.service(url,data,actback);
    },
    service(url,data,act,callback_success=null,callback_failed=null)
    {
        if(!data)data={};

        data["act"]=act;

        InduxsoftCrudlModel.InvokeService(url,data,
	    function(data)
	    {
            if(callback_success)callback_success(data);
            else window.location.reload();
	    	
	    },
	    function(error)
	    {
	    	if(callback_failed)callback_failed(error);
            else alert(error.message??error);
	    },"POST",false);
    }
}