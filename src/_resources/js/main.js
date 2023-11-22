var main = {
    init()
    {
        
    },
    request(url, method="GET", data=null, success, fail)
    {
        let fetchData = {
            method: method,
            mode: 'cors',
            headers:{
                'Access-Control-Allow-Origin':'*'
            }
        }
        if (data) fetchData['body'] = JSON.stringify(data);

        fetch(url, fetchData).then(response => 
        {
            if (response.ok){
                const isJson = response.headers.get('content-type')?.includes('application/json');
                if (isJson)
                {
                    try
                    {
                        response.json().then(json => {
                            success(json);
                        }).catch(error=>success(error));
                    }
                    catch
                    {
                        success(response.message ?? response.status);
                    }
                }
                else
                {
                    success(response.message ?? response.status);
                }
            }
            else {
                const isJson = response.headers.get('content-type')?.includes('application/json');
                if (isJson)
                {
                    response.json().then(json => {
                        fail(json);
                    });
                }
                else
                {
                    fail((response.message ?? JSON.stringify(response)));
                }
            }
        })
        .catch(error => {
            fail(error.message ?? JSON.stringify(error));
        })
    },
    getValues(containerId='')
    {
        values = {};
        const controls = document.querySelectorAll(`#${containerId} input, #${containerId} select, #${containerId} textarea`);
        
        controls.forEach(control => {
            let v = control.value;
            if ((control.getAttribute('type')??'').toLowerCase() == 'number') v = Number(v);
            if (control.value.trim() != '') values[control.name] = v;
        });

        return values;
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
            modal.style.display = "none";
            modal.classList.remove('show');
            return true;
        }
        return false;
    }
}
window.addEventListener("DOMContentLoaded", () => {
    main.init();
});