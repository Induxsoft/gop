var main = {
    init()
    {
        
    },
    async request(url, method='GET', data=null, success, fail, reload=true, async=true, autorizations='', formdata=false)
    {
        let fetchData = {
            method: method,
            mode: 'cors',
            headers:{
                'Access-Control-Allow-Origin':'*'
            }
        }

        if (autorizations) fetchData.headers['Authorization'] = autorizations;
        if (data)
        {
            if (formdata) 
                fetchData['body'] = data;
            else 
            {
                fetchData.headers['Content-Type'] = 'application/json';
                fetchData['body'] = JSON.stringify(data);
            }
        }

        const resHandler = res => 
        {
            if (method.toUpperCase() == "DELETE" && (res == null || res=='undefined'))
            {
                success(res);
            }
            else
            {
                const isJson = res.headers.get('content-type')?.includes('application/json');
                if (isJson)
                {
                    res.json().then(json => 
                    {
                        if (json.success && success) {
                            success(json);
                        }
                        else if (!json.success && json.success != null && res.success != undefined && fail) {
                            fail(json);
                        }
                        else
                        {
                            if (res.status >= 200 && res.status < 300 && success) {
                                success(json);
                            }
                            else {
                                if (fail) fail(json);
                            }
                        }
                    }).catch(error=>success(error));
                }
                else {
                    success(res);
                }
            }

            // if (res.ok)
            // {
            //     const isJson = res.headers.get('content-type')?.includes('application/json');
            //     if (isJson)
            //     {
            //         try {
            //             res.json().then(json => {
            //                 success(json);
            //             }).catch(error=>success(error));
            //         }
            //         catch {
            //             success(res.message ?? res.status);
            //         }
            //     }
            //     else {
            //         success(res.message ?? res.status);
            //     }
            // }
            // else 
            // {
            //     const isJson = res.headers.get('content-type')?.includes('application/json');
            //     if (isJson) {
            //         res.json().then(json => {
            //             fail(json);
            //         });
            //     }
            //     else {
            //         fail((res.message ?? JSON.stringify(res)));
            //     }
            // }

            if(reload)
                window.location.reload();
        }

        if (async)
        {
            await fetch(url, fetchData).then(resHandler).catch(error => {
                if (fail) fail(error.message ?? JSON.stringify(error));
            });
        }
        else
        {
            fetch(url, fetchData).then(resHandler).catch(error => {
                if (fail) fail(error.message ?? JSON.stringify(error));
            });
        }
    },
    getValues(containerId='')
    {
        values = {};
        const controls = document.querySelectorAll(`#${containerId} input, #${containerId} select, #${containerId} textarea`);
        
        controls.forEach(control => 
        {
            if (values != null)
            {
                let v = '';

                if (control.id != 'inputv') v = control.value;
                else v = control.getAttribute('value');

                if (v.trim() == '' && control.getAttribute('required')=='true') {
                    alert('El campo: ' + control.name + ' es requerido');
                    control.focus();
                    values = null;
                }

                if (values && (control.getAttribute('type')??'').toLowerCase() == 'number' || ((control.getAttribute('hidden-type')??'') == 'number')) 
                    v = Number(v);

                if (values && v.toString().trim() != '') values[control.name] = v;
            }
        });

        return values;
    },
    setValues(containerId='', obj)
    {
        const controls = document.querySelectorAll(`#${containerId} input, #${containerId} select, #${containerId} textarea`);
        controls.forEach(control => {
            control.value = obj[control.name] ?? (control.getAttribute("default")??'');
        });
    },
    clearValues(containerId)
    {
        const controls = document.querySelectorAll(`#${containerId} input, #${containerId} select, #${containerId} textarea, #${containerId} input-key`);
        
        try
        {
            controls.forEach(control => {
                if (control.tagName.toLowerCase() != 'input-key')
                    control.value = '';
                else control.clear();
            });
            return true;
        }
        catch(error)
        {
            alert(error);
            return false;
        }
    },
    closeModal(modalId='')
    {
        const modal = document.getElementById(modalId);
        if (modal)
        {
            modal.style.display = 'none';
            modal.classList.remove('show');
            return true;
        }
        return false;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    main.init();
});