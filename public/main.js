
function esUrlValida(texto) {
    try {
        new URL(texto);
        return true;
    } catch (error) {
        return false;
    }
}

let valorParaCopiar = "";
let qrDownloadUrl = "";

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
    limpiarQr();
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
                limpiarQr();

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
    const copyButton = document.getElementById("copyButton");
    const downloadButton = document.getElementById("downloadButton");

    if (!esUrlValida(input)) {
        alert("Por favor ingrese una URL valida");
        return;
    }

    try {
        let logoDataUrl = "";

        if (logoInput.files.length > 0) {
            const archivo = logoInput.files[0];
            const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];

            if (!tiposPermitidos.includes(archivo.type)) {
                alert("La imagen debe ser PNG, JPG o WebP");
                return;
            }

            if (archivo.size > 2 * 1024 * 1024) {
                alert("La imagen no debe superar 2 MB");
                return;
            }

            logoDataUrl = await leerArchivoComoDataUrl(archivo);
        }

        await renderizarQr(input, logoDataUrl);

        valorParaCopiar = input;
        resultado.style.display = "block";
        successMsg.innerText = "Tu QR apunta directo al link original.";
        linkOriginal.innerText = input;
        linkOriginal.href = input;
        linkCorto.innerText = "";
        linkCorto.href = "#";
        shortLinkRow.style.display = "none";
        qrPreview.style.display = "block";
        copyButton.innerText = "Copiar URL";
        downloadButton.style.display = "block";
    } catch (error) {
        console.error("Error al generar el QR:", error);
        alert("UPS... Hubo un error generando el QR");
    }
}

function descargarQr() {
    if (!qrDownloadUrl) {
        alert("Primero genera un QR");
        return;
    }

    const link = document.createElement("a");
    link.href = qrDownloadUrl;
    link.download = "qr-url.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function limpiarQr() {
    const qrCanvas = document.getElementById("qrCanvas");

    if (qrCanvas) {
        qrCanvas.innerHTML = "";
    }

    qrDownloadUrl = "";
}

function leerArchivoComoDataUrl(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
        reader.readAsDataURL(archivo);
    });
}

async function renderizarQr(url, logoDataUrl) {
    const qrCanvas = document.getElementById("qrCanvas");

    limpiarQr();

    new QRCode(qrCanvas, {
        text: url,
        width: 320,
        height: 320,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    await esperarRenderQr();

    const canvas = qrCanvas.querySelector("canvas");
    const imagenQr = qrCanvas.querySelector("img");

    if (logoDataUrl) {
        const logo = document.createElement("img");
        logo.src = logoDataUrl;
        logo.alt = "Logo del QR";
        logo.className = "qr-logo";
        qrCanvas.appendChild(logo);
    }

    if (canvas) {
        qrDownloadUrl = canvas.toDataURL("image/png");
        return;
    }

    if (imagenQr) {
        qrDownloadUrl = imagenQr.src;
        return;
    }

    throw new Error("No se pudo renderizar el QR");
}

function esperarRenderQr() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => resolve());
    });
}
