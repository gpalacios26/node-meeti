document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#ubicacion-meeti')) {
        mostrarMapa();
    }
});

function mostrarMapa() {
    // Obtener los valores
    const lat = document.querySelector('#lat').value === '' ? -12.0405721 : document.querySelector('#lat').value;
    const lng = document.querySelector('#lng').value === '' ? -76.9265165 : document.querySelector('#lng').value;
    const direccion = document.querySelector('#direccion').value;

    mapboxgl.accessToken = 'pk.eyJ1IjoiZ3BhbGFjaW9zMjYiLCJhIjoiY2txOGltM2hxMGdkOTJ2bXF3dHdnYTdhaSJ9.QQE1iAlk_2h-XSbDECRdjw';
    const map = new mapboxgl.Map({
        container: 'ubicacion-meeti',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: 16
    });

    let fullView = new mapboxgl.FullscreenControl();
    map.addControl(fullView, "top-right");

    let popup = new mapboxgl.Popup({ offset: 25 }).setText(direccion);

    let marker;
    marker = new mapboxgl.Marker({
        draggable: false
    }).setLngLat([lng, lat]).setPopup(popup).addTo(map).togglePopup();
}