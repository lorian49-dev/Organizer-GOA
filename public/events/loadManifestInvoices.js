const currentPath = window.location.pathname;
const isManifestPage = currentPath.includes('loadManiefst');
// configuracion dinamica de la url de la pagina dependiendo de la ubicacion actual
const PAGE_CONFIG = {
    getSearchDocument : isManifestPage? '/search-manifest': '/search-invoice',
    getPostPath: isManifestPage? '/manifest-table-post':'/invoice-table-post',
    getEndpoint: isManifestPage ? '/manifest-table-get' : '/invoices-table-get',
    deleteEndpoint: isManifestPage ? '/action-delete-manifest' : '/action-delete',
    idField: isManifestPage ? 'id_manifest' : 'id_invoice',
    emptyMessageText: isManifestPage ? 'Sin registros, tabla de manifiestos vacía' : 'Sin registros, tabla de Facturas vacía'
};

// Variables y elementos del DOM
const inputSearchGlass = document.getElementById('search-glass');
const searchGlassResults = document.querySelector('.field-results-glasses');
const pdf_container = document.querySelector('.pdf-container-tbody');
const btnNext = document.querySelector('.btnNext');
const btnBack = document.querySelector('.btnBack');
const pageInfo = document.querySelector('.page-info');
const emptyMessage = document.querySelector('.empty-message');
const containerFilterBar = document.querySelector('.container-filters');
const filterBar = document.querySelector('.filter-bar');
const filterByModel = document.querySelector('.filter-by-model');
const filterByReference = document.querySelector('.filter-by-reference')
// navBar Constantes
const magnifier = document.querySelector('.fa-magnifying-glass')
const navEgation = document.querySelector('nav')
const formManifestAndInvoice = document.querySelector('.form-documents');
// Zona de Arrastrar y soltar .pdf
const dropZone = document.querySelector('.drag-and-drop');
const dropZoneInput = document.getElementById('btn-file');
const dropZoneFileInfo = document.getElementById('file-info')
const dropZoneEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
const activeDropzone = [dropZoneEvents[0], dropZoneEvents[1]];
const offDropZone = [dropZoneEvents[2], dropZoneEvents[3]];
const shapeDragAndDrop = document.querySelector('.shape-drag-and-drop')
const fileToServer = document.querySelector('.file')
const processBarContainer = document.querySelector('.process-container')
const processBar = document.querySelector('.process-bar')
const circleFeedBack = document.querySelector('.feedback-circle')
const iconUbication = ['<img src="/src/check-icon.png">', '<img src="/src/error-icon.png">']
const checkFeedBack = document.querySelector('.check-feedback')
// Variables cambiantes
let currentPage = 1;
let globalTotalRows = 0;
let valueInput
let valueFilter
let stateSearch = false

// Utilidades
const searchByGlass = document.querySelector('.hello') // variable la cual tendra una clase de la que cuando se active se buscara un documento por gafas
const searchByGlassReference = document.querySelector('.hola') // variable la cual tendra una clase de la que cuando se active se buscara un documento por referencia
const breakPoint = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// un debounce es lo que cree para tener por cada evento de tecleo en un input, un tiempo de respuesta establecido para no saturar al servidor de solicitudes.
const debounce = (fn, delay) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};

const goHome = () => {
    window.location.href = '/';
};


// la siguiente funcion se encargara de prevenir el evento por defecto del navegador al momento de usar un drop zone para documentos.

const preventEventDropZoneActive = (event) =>{
 event.preventDefault();
 dropZone.classList.add('active')
}

const preventEventDropZoneOff = (event) =>{
    event.preventDefault();
    dropZone.classList.remove('active')
}

// funcion Para Abrir la barra de navegacion

 const openNavBar = async(a, b) =>{
   
    if(!a){
        navEgation.classList.add('active');
        formManifestAndInvoice.classList.add('active')
        setTimeout(()=>{inputSearchGlass.classList.add('active')}, 1000)
    }else{
        inputSearchGlass.classList.remove('active');
        setTimeout(()=>{formManifestAndInvoice.classList.remove('active')}, 500)
        await b(500);
        if(dropZone.classList.contains('on')) dropZone.classList.remove('on');
        navEgation.classList.remove('active')

    }
   
 }

// Transición de carga de página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
    }, 1000);
});

// Render de la tabla
async function tableInformation(code, filter) {
    // Placeholder fantasma de carga
    pdf_container.innerHTML = `<tr>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
    </tr>`;

    try {
        const params = new URLSearchParams({
            page: currentPage
        })

        params.append('code', code)
        params.append('filter', filter)
        // Usamos el endpoint dinámico según la página
        const res = await fetch(`${PAGE_CONFIG.getEndpoint}?${params.toString()}`);
        const reqData = await res.json();
        const response = reqData.data;
        globalTotalRows = reqData.totalRows;

        // Estilos de los botones de Paginación
        if (currentPage === 1) {
            btnBack.style.color = '#adadad';
            btnBack.style.pointerEvents = 'none';
        } else {
            btnBack.style.color = '#383838';
            btnBack.style.pointerEvents = 'auto';
        }

        if (currentPage === globalTotalRows || globalTotalRows === 0) {
            btnNext.style.color = '#adadad';
            btnNext.style.pointerEvents = 'none';
        } else {
            btnNext.style.color = '#383838';
            btnNext.style.pointerEvents = 'auto';
        }

        // Mensaje de tabla vacía dinámico
        if (globalTotalRows === 0) {
            emptyMessage.innerHTML = `<p>${PAGE_CONFIG.emptyMessageText}</p>`;
        } else {
            emptyMessage.innerHTML = '';
        }

        pdf_container.innerHTML = '';

        for (const file of response) {
            const newRow = document.createElement('tr');
            
            const tableName = document.createElement('td');
            tableName.textContent = file.name;
            tableName.classList.add('row-name-table')
            tableName.title = tableName.textContent;
            
            const tableSize = document.createElement('td');
            tableSize.textContent = parseInt((file.weight) / 1024) + ' Kb';
            
            const tableDate = document.createElement('td');
            tableDate.textContent = new Date(file.date).toLocaleString();
            
            const eyeUrl = document.createElement('td');
            eyeUrl.innerHTML = `<a href="${file.url}" target="_blank"><i class="fa-solid fa-eye"></i></a>`;
            
            const btnDelete = document.createElement('td');
            btnDelete.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            btnDelete.classList.add('olvidona');

            // Lógica de borrado dinámica
            btnDelete.addEventListener('click', async () => {
                const eliminar = confirm('¿Estás seguro de que quieres eliminar este registro?');
                if (!eliminar) return;

                try {
                    // Accedemos al ID dinámico según la página
                    const fileId = file[PAGE_CONFIG.idField];
                    const responseDelete = await fetch(`${PAGE_CONFIG.deleteEndpoint}/${fileId}`, { method: 'DELETE' });

                    if (responseDelete.ok) {
                        btnDelete.closest('tr').remove();
                    }
                } catch (error) {
                    console.error('Error de red eliminando:', error);
                }
            });
            
            newRow.appendChild(tableName);    
            newRow.appendChild(tableSize);    
            newRow.appendChild(tableDate);    
            newRow.appendChild(eyeUrl);
            newRow.appendChild(btnDelete); 

            pdf_container.appendChild(newRow);
        }

        // Información de paginación
        if(globalTotalRows > 0) {
            pageInfo.innerHTML = `<p>1-${response.length} de ${globalTotalRows}</p>`;
        } else {
            pageInfo.innerHTML = '';
        }

    } catch(error) {
        console.error('Error obteniendo la tabla:', error);
        pdf_container.innerHTML = '<tr><td colspan="5">Ocurrió un error al cargar la información</td></tr>';
    }
}

// Buscador de monturas y autocompletado
// Actualmente esta funcion no esta en uso, pero no se descarta si se llega a necesitar.
async function autoCompleteGlass(input, field) {
    field.innerHTML = '';
    field.style.display = 'none';
    if (input.classList.contains('boxShadowOff')) {
        input.classList.remove('boxShadowOff');
    }
    
    const valueSearch = input.value;
    if (valueSearch.length < 2) return;

    try {
        const res = await fetch(`/search-glass-results?glass=${valueSearch}`);
        const data = await res.json();

        if (data.length === 0) return field.style.display = 'none';
        
        data.forEach(item => {
            const result = document.createElement('div');
            result.classList.add('item-glass-result');
            result.textContent = item.code || item.reference;

            result.addEventListener('click', () => {
                window.location.href = `/search-mid?glass_model=${result.textContent}`;
            });

            field.appendChild(result);
        });

        field.style.display = 'block';
        input.classList.add('boxShadowOff');
    } catch (error) {
        console.error('Error buscando monturas:', error);
    }
}

const autoCompleteDocument = async(input, field) =>{
    try{
    if(input.value){
    field.innerHTML = ' '
    if(input.value.length < 2 || stateSearch){
        field.style.display = 'none'
        input.classList.remove('boxShadowOff')
        return 
    }

    const value = input.value;
    const res = await fetch(`${PAGE_CONFIG.getSearchDocument}?name=${value}`);
    const data = await res.json();

    if(Array.isArray(data) && data.length >= 1){ 
        data.forEach(item=>{
        const rowResult = document.createElement('div');
        rowResult.classList.add('item-glass-result');
        rowResult.title = item.name
        rowResult.textContent = item.name;
        field.appendChild(rowResult)

        rowResult.addEventListener('click', ()=>{
            input.value = rowResult.textContent
            field.innerHTML = ' ';
            field.style.display = 'none'
            input.classList.remove('boxShadowOff');
        })

    })

    field.style.display = 'block'
    input.classList.add('boxShadowOff');

    document.addEventListener('click', (place)=>{
        if(!inputSearchGlass.contains(place.target) && !searchGlassResults.contains(place.target)){
            field.innerHTML = ' ';
            field.style.display = 'none'
            input.classList.remove('boxShadowOff');
        }
    })

    } else{
        field.style.display = 'none'
        input.classList.remove('boxShadowOff');
    }



 }else{
    field.innerHTML = ' '
        field.style.display = 'none'
        input.classList.remove('boxShadowOff')
        return 
 }
    }catch(error){
        console.log('error en la consulta o no se obtuvieron resultados')
    }
}

if (inputSearchGlass) {
    inputSearchGlass.addEventListener('input', debounce(() => {
         autoCompleteDocument(inputSearchGlass, searchGlassResults)
    }, 300));

    formManifestAndInvoice.addEventListener('submit', (event)=>{
        event.preventDefault()
        stateSearch = true;
        currentPage = 1;
        valueInput = inputSearchGlass.value
        switch (valueFilter) {
            case 'isModel':
                 tableInformation(valueInput, 'isModel')
                break;
            case 'isReference':
                 tableInformation(valueInput, 'isReference')
                break
            default: tableInformation(valueInput)
                break;
        }
        searchGlassResults.innerHTML = ' '
        searchGlassResults.style.display = 'none';
        inputSearchGlass.classList.remove('boxShadowOff')
        setTimeout(()=>stateSearch = !stateSearch, 300)
        
    })
}



// Eventos en la NavBar 

if(magnifier){
    magnifier.addEventListener('click', async()=>{
     const navIsActive = navEgation.classList.contains('active')
     openNavBar(navIsActive, breakPoint)
    })
}

// Zona de Arrastrar y soltar .pdf
activeDropzone.forEach(eventZone =>{
    dropZone.addEventListener(eventZone, preventEventDropZoneActive);
// Eventos para Arrastrar el documento en toda la pagina
      document.addEventListener(eventZone, ()=>{
     const navIsActiveForDrag = navEgation.classList.contains('active')
     if(!navIsActiveForDrag){
       navEgation.classList.add('active')
       dropZone.classList.add('on')
       formManifestAndInvoice.classList.add('active')
       setTimeout(()=>{
      inputSearchGlass.classList.add('active')
      }, 1000)
     }else{
       dropZone.classList.add('on')
     }
      })
})
dropZone.addEventListener('dragleave', preventEventDropZoneOff);
document.addEventListener('dragover', (event)=>{event.preventDefault()})
document.addEventListener('drop', (event)=>{
    event.preventDefault()
  if(!dropZone.contains(event.target)){
    dropZone.classList.remove('on')
  }
});
dropZone.addEventListener('drop', async(event)=>{
    event.preventDefault()
    circleFeedBack.classList.add('active')
    shapeDragAndDrop.classList.add('active')
    const filePdf = event.dataTransfer.files;
    const feedBackAd = ['Paciencia por favor', 'Esto podria demorar unos minutos']
    const feedBackAdAlmost = ['Ya casi', 'Solo un poco mas']
    let i = 0;
    if(filePdf.length > 1){
        dropZoneFileInfo.textContent = 'Subiendo Documentos'
    }else{
        dropZoneFileInfo.textContent = 'Subiendo su Documento'
    }
    let feedBackChange = setInterval(()=>{
     dropZoneFileInfo.textContent = feedBackAd[i]
     i = (i+1) % feedBackAd.length
    }, 2000)
    if(filePdf.length > 0){
        try{
        const formToSend = new FormData();
        for(let i = 0; i < filePdf.length;i++){
         formToSend.append('filePDF[]', filePdf[i])
        }
      /*  const data = await fetch(`${PAGE_CONFIG.getPostPath}`,{
            method: 'POST',
            body: formToSend
        })

        if(data.ok){
            console.log('archivo subido!')
        }else{
            return console.log('error al subir archivos :c')
        } */
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event)=>{
              if(event.lengthComputable){
                const porcentaje = Math.round((event.loaded / event.total)*100);
                processBar.style.width = `${porcentaje}%`
                if(porcentaje >= 70){
                    clearInterval(feedBackChange)
                    feedBackChange = setInterval(()=>{
                     dropZoneFileInfo.textContent = feedBackAdAlmost[i];
                     i = (i+1) % feedBackAdAlmost.length;
                    }, 1000)
                }
                    
                console.log(porcentaje)
              }
            })

            xhr.addEventListener('load', async ()=>{
                if(xhr.status >= 200 && xhr.status < 300){
                    checkFeedBack.innerHTML = iconUbication[0]
                    checkFeedBack.style.opacity = '1'
                    clearInterval(feedBackChange)
                    dropZoneFileInfo.textContent = 'Hecho!'
                    await breakPoint(500)
                    fileToServer.classList.add('done') // este es el objeto de la forma de documento
                    await breakPoint(1000);
                    shapeDragAndDrop.classList.remove('active') // este es el restablecimiento del lugar de la capa movil
                    processBar.style.width = '0%' // se devuelve la barra a su estado inicial
                    await breakPoint(500);
                    dropZone.classList.remove('active') // se devuelve la zona de drop a su estado inicial(se quita el color blanco de fondo)
                    fileToServer.classList.remove('done') // se reinicia para un futuro uso de la animacion
                    checkFeedBack.style.opacity = '0' // se regresa la opacidad del icono del estado 
                    dropZoneFileInfo.textContent = ' ' // Se resetea el contenido del campo de feedback textual
                    circleFeedBack.classList.remove('active'); // se elimina la visualizacion del circulo de carga
                } else{
                    processBar.style.width = '0%' // se devuelve la barra a su estado inicial
                    processBarContainer.classList.add('error')
                     checkFeedBack.innerHTML = iconUbication[1]
                    checkFeedBack.style.opacity = '1'
                    clearInterval(feedBackChange)
                    dropZoneFileInfo.textContent = 'Hubo un error, intenta de nuevo'
                    await breakPoint(500)
                    fileToServer.classList.add('done') // este es el objeto de la forma de documento
                    await breakPoint(1000);
                    shapeDragAndDrop.classList.remove('active') // este es el restablecimiento del lugar de la capa movil
                    await breakPoint(500);
                    dropZone.classList.remove('active') // se devuelve la zona de drop a su estado inicial(se quita el color blanco de fondo)
                    fileToServer.classList.remove('done') // se reinicia para un futuro uso de la animacion
                    checkFeedBack.style.opacity = '0' // se regresa la opacidad del icono del estado 
                    dropZoneFileInfo.textContent = ' ' // Se resetea el contenido del campo de feedback textual
                    circleFeedBack.classList.remove('active'); // se elimina la visualizacion del circulo de carga
                    processBarContainer.classList.remove('error')
                }
            })

            xhr.addEventListener('error', async()=>{
                 processBar.style.width = '0%' // se devuelve la barra a su estado inicial
                    processBarContainer.classList.add('error')
                     checkFeedBack.innerHTML = iconUbication[1]
                    checkFeedBack.style.opacity = '1'
                    clearInterval(feedBackChange)
                    dropZoneFileInfo.textContent = 'No se Pudo Establecer Conexion'
                    await breakPoint(500)
                    fileToServer.classList.add('done') // este es el objeto de la forma de documento
                    await breakPoint(1000);
                    shapeDragAndDrop.classList.remove('active') // este es el restablecimiento del lugar de la capa movil
                    await breakPoint(500);
                    dropZone.classList.remove('active') // se devuelve la zona de drop a su estado inicial(se quita el color blanco de fondo)
                    fileToServer.classList.remove('done') // se reinicia para un futuro uso de la animacion
                    checkFeedBack.style.opacity = '0' // se regresa la opacidad del icono del estado 
                    dropZoneFileInfo.textContent = ' ' // Se resetea el contenido del campo de feedback textual
                    circleFeedBack.classList.remove('active'); // se elimina la visualizacion del circulo de carga
                    processBarContainer.classList.remove('error')
            })

            xhr.open('POST', PAGE_CONFIG.getPostPath);
            xhr.send(formToSend)
      
        }catch(error){
    console.log(`Hubo un problema con la conexion:`, error)
        }
    }
    
})

// Inicializar la tabla al cargar
if(pdf_container){
    tableInformation();
}

// Paginacion
const clickNext = () => {
    if (currentPage < globalTotalRows && !valueInput) {
        pdf_container.innerHTML = '';
        currentPage++;
        tableInformation();
    }else{
        pdf_container.innerHTML = '';
        currentPage++;
        tableInformation(valueInput);
    }
};

const clickBack = () => {
    if (currentPage > 1 && !valueInput) {
        pdf_container.innerHTML = '';
        currentPage--;
        tableInformation();
    }else{
        pdf_container.innerHTML = '';
        currentPage--;
        tableInformation(valueInput);
    }
};

const clickFilterAction = (btn1, btn2, valueBtn)=>{
     btn1.addEventListener('click', ()=>{

       if(!btn2.classList.contains('picked')){
        btn1.classList.toggle('picked')
        if(btn1.classList.contains('picked')){
            valueFilter = valueBtn;
        } else{
            valueFilter = '';
        }
       }
     })
}

clickFilterAction(filterByModel, filterByReference, 'isModel');
clickFilterAction(filterByReference, filterByModel, 'isReference');

filterBar.addEventListener('click', async()=>{
 containerFilterBar.classList.toggle('active')
 if(containerFilterBar.classList.contains('active')){
    filterByModel.classList.add('active');
    filterByReference.classList.add('active');
 }else{
    filterByModel.classList.remove('active');
    filterByReference.classList.remove('active');
 }
})

