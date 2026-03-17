const tableResultGlasses = document.querySelector('.table-search-results');
const tableBodyGlasses = document.querySelector('.table-body-results')
const goHome = () =>{
    window.location.href = '/'
}

addEventListener('DOMContentLoaded', async()=>{
            setTimeout(()=>{
       document.body.style.opacity = '1'
       document.body.style.pointerEvents = 'auto'

      }, 1000)});

const showInfoGlasses = async() => {
    const params = new URLSearchParams(window.location.search);
    const model = params.get('glass_model');
    const res = await fetch(`/search-glasses-table?glass_model=${model}`);
    const data = await res.json();

    data.forEach(item => {
        const newTr = document.createElement('tr');
        newTr.innerHTML = ` <td><input type='checkbox'></td>
                            <td>${item.brand}</td>
                            <td>${item.code}</td>
                            <td>${item.ship_order}</td>
                            <td><a href='${item.invoice_id.url}' target='_blank'><i class="fa-solid fa-file-pdf"></i></a></td>
                            <td><a href='${item.manifest_id.url}' target='_blank'><i class="fa-solid fa-file-pdf"></i></a></td>`;
        tableBodyGlasses.appendChild(newTr);
    })

}

showInfoGlasses();


    