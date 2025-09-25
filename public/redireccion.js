const params = new URLSearchParams(window.location.search);
const link = params.get('u');

if (link) {
    redireccionar();
}

async function redireccionar() {
    try {
        const res = await fetch('/url-shortenner/src/api/obtener_url.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigo: link
            })
        });

        const data = await res.json();

        if (data.success) {
            window.location.href = data.url
        }
    } catch (e) {
        console.error("Error al redireccionar: " + e);
        
    }
}
