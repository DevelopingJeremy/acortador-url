
function esUrlValida(texto) {
    try {
        new URL(texto);
        return true;
    } catch (error) {
        return false;
    }
}

let valorParaCopiar = "";
let qrGenerado = "";

function obtenerModo() {
    const modoSeleccionado = document.querySelector('input[name="modo"]:checked');
    return modoSeleccionado ? modoSeleccionado.value : "short";
}

function cambiarModo() {
    const modo = obtenerModo();
    const qrOptions = document.getElementById("qrOptions");
    const submitButton = document.getElementById("submitButton");
    const resultado = document.getElementById("resultado");

    qrOptions.style.display = modo === "qr" ? "block" : "none";
    submitButton.innerText = modo === "qr" ? "Crear QR" : "Acortar Link";
    resultado.style.display = "none";
}

function copiar() {
    if (!valorParaCopiar) {
        alert("No hay nada para copiar todavia");
        return;
    }

    navigator.clipboard.writeText(valorParaCopiar).then(() => {
        alert("Copiado al portapapeles");
    }).catch(err => {
        console.error("Error al copiar: ", err);
        alert("No se pudo copiar");
    });
}

function crearNuevo() {
    document.getElementById("urlInput").value = "";
    document.getElementById("logoInput").value = "";
    document.getElementById("resultado").style.display = "none";
    valorParaCopiar = "";
    qrGenerado = "";
}

function procesarFormulario() {
    if (obtenerModo() === "qr") {
        crearQr();
        return;
    }

    acortar();
}

async function acortar() {
    const input = document.getElementById("urlInput").value;
    const resultado = document.getElementById("resultado");
    const linkOriginal = document.getElementById('linkOriginal');
    const linkCorto = document.getElementById('linkCorto');
    const successMsg = document.getElementById("successMsg");
    const shortLinkRow = document.getElementById("shortLinkRow");
    const qrPreview = document.getElementById("qrPreview");
    const copyButton = document.getElementById("copyButton");
    const downloadButton = document.getElementById("downloadButton");

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
                valorParaCopiar = urlAcortada;
                qrGenerado = "";

                resultado.style.display = 'block';
                successMsg.innerText = "Tu link se ha acortado con exito.";
                linkOriginal.innerText = input;
                linkOriginal.href = input;
                linkCorto.innerText = urlAcortada;
                linkCorto.href = urlAcortada;
                shortLinkRow.style.display = "block";
                qrPreview.style.display = "none";
                copyButton.innerText = "Copiar Link";
                downloadButton.style.display = "none";
            } else {
                throw new Error("El backend devolvió error");
            }

        } catch (error) {
            console.error('Error al guardar la URL:', error);
            alert("UPS... Hubo un error, intentalo nuevamente")
            return;
        }
    }

async function crearQr() {
    const input = document.getElementById("urlInput").value;
    const logoInput = document.getElementById("logoInput");
    const resultado = document.getElementById("resultado");
    const linkOriginal = document.getElementById("linkOriginal");
    const linkCorto = document.getElementById("linkCorto");
    const successMsg = document.getElementById("successMsg");
    const shortLinkRow = document.getElementById("shortLinkRow");
    const qrPreview = document.getElementById("qrPreview");
    const qrImage = document.getElementById("qrImage");
    const copyButton = document.getElementById("copyButton");
    const downloadButton = document.getElementById("downloadButton");

    if (!esUrlValida(input)) {
        alert("Por favor ingrese una URL valida");
        return;
    }

    const formData = new FormData();
    formData.append("url", input);

    if (logoInput.files.length > 0) {
        formData.append("logo", logoInput.files[0]);
    }

    try {
        const res = await fetch('/url-shortenner/src/api/generar_qr.php', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            valorParaCopiar = data.url_directa;
            qrGenerado = data.qr;

            resultado.style.display = "block";
            successMsg.innerText = "Tu QR apunta directo al link original.";
            linkOriginal.innerText = data.url_directa;
            linkOriginal.href = data.url_directa;
            linkCorto.innerText = "";
            linkCorto.href = "#";
            shortLinkRow.style.display = "none";
            qrImage.src = data.qr;
            qrPreview.style.display = "block";
            copyButton.innerText = "Copiar URL";
            downloadButton.style.display = "block";
        } else {
            throw new Error(data.message || "El backend devolvio error");
        }
    } catch (error) {
        console.error("Error al generar el QR:", error);
        alert("UPS... Hubo un error generando el QR");
    }
}

function descargarQr() {
    if (!qrGenerado) {
        alert("Primero genera un QR");
        return;
    }

    const link = document.createElement("a");
    link.href = qrGenerado;
    link.download = "qr-url.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
}
