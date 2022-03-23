import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

document.addEventListener('DOMContentLoaded', () => {

    if (document.querySelector('#mapa')) {
        const lat = document.querySelector('#lat').value === '' ? -12.0405721 : document.querySelector('#lat').value;
        const lng = document.querySelector('#lng').value === '' ? -76.9265165 : document.querySelector('#lng').value;

        mapboxgl.accessToken = 'pk.eyJ1IjoiZ3BhbGFjaW9zMjYiLCJhIjoiY2txOGltM2hxMGdkOTJ2bXF3dHdnYTdhaSJ9.QQE1iAlk_2h-XSbDECRdjw';
        const map = new mapboxgl.Map({
            container: 'mapa',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: 16
        });

        let fullView = new mapboxgl.FullscreenControl();
        map.addControl(fullView, "top-right");

        let navView = new mapboxgl.NavigationControl({
            showCompass: false,
            showZoom: true
        });
        map.addControl(navView, "top-right");

        let marker;
        marker = new mapboxgl.Marker({
            draggable: true
        }).setLngLat([lng, lat]).addTo(map);

        marker.on('dragend', onDragEnd);

        function onDragEnd() {
            const lngLat = marker.getLngLat();
            let urlCoordenadas = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + lngLat.lng + "," + lngLat.lat + ".json?country=PE&language=es&access_token=" + mapboxgl.accessToken;

            fetch(urlCoordenadas).then(response => response.json()).then(data => {
                if (data && data.features && data.features.length > 0) {
                    let resultados = data.features;
                    llenarInputs(resultados[0]);
                }
            });
        }

        const buscador = document.querySelector('#formbuscador');
        buscador.addEventListener('blur', buscarDireccion);

        function buscarDireccion(e) {
            if (e.target.value.length > 1) {
                let valor = e.target.value;
                let direccion = valor.replace(/ /g, "%20") + '%20Lima';
                let urlDireccion = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + direccion + ".json?country=PE&language=es&access_token=" + mapboxgl.accessToken;

                fetch(urlDireccion).then(response => response.json()).then(data => {
                    if (data && data.features && data.features.length > 0) {
                        let resultados = data.features;
                        let newLng = resultados[0].geometry.coordinates[0];
                        let newLat = resultados[0].geometry.coordinates[1];
                        marker.setLngLat([newLng, newLat]);
                        map.flyTo({ center: [newLng, newLat] });
                        onDragEnd();
                    }
                });
            }
        }

        function llenarInputs(resultado) {
            document.querySelector('#direccion').value = resultado.properties.address || resultado.place_name;
            document.querySelector('#ciudad').value = resultado.context[2].text_es || '';
            document.querySelector('#estado').value = resultado.context[3].text_es || '';
            document.querySelector('#pais').value = resultado.context[4].text_es || '';
            document.querySelector('#lat').value = resultado.geometry.coordinates[1] || '';
            document.querySelector('#lng').value = resultado.geometry.coordinates[0] || '';
        }
    }

});