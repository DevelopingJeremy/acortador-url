
function esUrlValida(texto) {
    try {
        new URL(texto);
        return true;
    } catch (error) {
        return false;
    }
}

function copiar() {
    const linkCorto = document.getElementById("linkCorto").href;

    // Copiar al portapapeles
    navigator.clipboard.writeText(linkCorto).then(() => {
        alert("Link copiado al portapapeles");
    }).catch(err => {
        console.error("Error al copiar el link: ", err);
        alert("No se pudo copiar el link");
    });
}

function crearNuevo() {
    acortar();
}

async function acortar() {
    const input = document.getElementById("urlInput").value;
    const resultado = document.getElementById("resultado");
    const linkOriginal = document.getElementById('linkOriginal');
    const linkCorto = document.getElementById('linkCorto');
    let urlAcortada = "";

    if (!esUrlValida(input)) {
        alert("Por favor ingrese una URL valida")
        return;
    }

    try {
            const res = await fetch('/url-shortenner/src/api/guardar_url.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: input })
            });

            const data = await res.json();

            if (data.success) {
                const urlAcortada = data.url_nueva;

                // Mostrar resultados en la UI
                resultado.style.display = 'block';
                linkOriginal.innerText = input;
                linkOriginal.href = input;
                linkCorto.innerText = urlAcortada;
                linkCorto.href = urlAcortada;
            } else {
                throw new Error("El backend devolvió error");
            }

        } catch (error) {
            console.error('Error al guardar la URL:', error);
            alert("UPS... Hubo un error, intentalo nuevamente")
            return;
        }
    }