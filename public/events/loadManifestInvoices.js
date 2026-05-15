const currentPath = window.location.pathname;
const isManifestPage = currentPath.includes('manifiestos');

const PAGE_CONFIG = {
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
const dropZone = document.querySelector('.drag-and-drop');
const dropZoneInput = document.getElementById('btn-file');
const dropZoneFileInfo = document.getElementById('file-info')

let currentPage = 1;
let globalTotalRows = 0;

// Utilidades
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

// Transición de carga de página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
    }, 1000);
});

// Buscador de monturas y autocompletado
async function autoCompleteGlass(input, field) {
    field.innerHTML = '';
    field.style.display = 'none';
    if (input.classList.contains('boxShadowOn')) {
        input.classList.remove('boxShadowOn');
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
            result.textContent = item.code;

            result.addEventListener('click', () => {
                window.location.href = `/search-mid?glass_model=${item.code}`;
            });

            field.appendChild(result);
        });

        field.style.display = 'block';
        input.classList.add('boxShadowOn');
    } catch (error) {
        console.error('Error buscando monturas:', error);
    }
}

if (inputSearchGlass) {
    inputSearchGlass.addEventListener('input', debounce(() => {
        autoCompleteGlass(inputSearchGlass, searchGlassResults);
    }, 300));
}

// Zona de Arrastrar y soltar .pdf

const eventDropZone = ['dragenter', 'dragover', 'dragleave', 'drop'];

const blockFunctionActive = (event) =>{
 event.preventDefault();
 dropZone.classList.add('active')

}

const blockFunctionNoActive = (event) =>{
 event.preventDefault();
 dropZone.classList.remove('active')
}

const activeDropZone = [eventDropZone[0], eventDropZone[1]]

const removeDropZone = [eventDropZone[2], eventDropZone[3]]

activeDropZone.forEach(event =>{
    dropZone.addEventListener(event, blockFunctionActive);
})
removeDropZone.forEach(event =>{
    dropZone.addEventListener(event, blockFunctionNoActive);
})

dropZone.addEventListener('drop', (event)=>{
    const filesPdf = event.dataTransfer.files
    const filePdf = filesPdf[0]
    dropZoneFileInfo.textContent = filePdf.name
})

// Render de la tabla
async function tableInformation() {
    // Placeholder fantasma de carga
    pdf_container.innerHTML = `<tr>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
        <td><span class="phantom-placeholder" style="display:inline-block"></span></td>
    </tr>`;

    try {
        // Usamos el endpoint dinámico según la página
        const res = await fetch(`${PAGE_CONFIG.getEndpoint}?page=${currentPage}`);
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

// Inicializar la tabla al cargar
tableInformation();

// Paginacion
const clickNext = () => {
    if (currentPage < globalTotalRows) {
        pdf_container.innerHTML = '';
        currentPage++;
        tableInformation();
    }
};

const clickBack = () => {
    if (currentPage > 1) {
        pdf_container.innerHTML = '';
        currentPage--;
        tableInformation();
    }
};