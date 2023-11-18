var main = {
    init()
    {
        console.log('main loaded');
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
                    response.json().then(json => {
                        success(json);
                    });
                }
                else
                {
                    success(response.message ?? response.status);
                }
            }
            else{
                console.log(4);
                fail("El servicio respondió con un estado unválido");
            }
        })
        .catch(error => {
            fail(error.message ? error.message : JSON.stringify(error));
        })
    },
    getValues(containerId='')
    {
        values = {};
        const controls = document.querySelectorAll(`#${containerId} input, #${containerId} select, #${containerId} textarea`);
        
        controls.forEach(control => {
            if (control.value.trim()) values[control.name] = control.value;
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
            modal.className="modal fade";
            return true;
        }
        return false;
    }
}
window.addEventListener("DOMContentLoaded", () => {
    main.init();
});