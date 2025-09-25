# Acortador de URLs

Sistema web para acortar enlaces de forma rápida y elegante, ideal para compartir en redes sociales. Desarrollado en PHP, MySQL y JavaScript, con una interfaz moderna y responsiva.

## Características

- Acorta cualquier URL en segundos.
- Copia el enlace acortado al portapapeles.
- Guarda y consulta enlaces en base de datos.
- Contador de clics por enlace.
- Interfaz profesional y adaptable a móviles.

## Estructura del proyecto

```
acortador/
├── index.html              # Interfaz principal
├── public/
│   ├── main.js            # Lógica JS de frontend
│   ├── style.css          # Estilos modernos
├── src/
│   ├── api/
│   │   ├── guardar_url.php    # API para guardar/acortar URLs
│   │   ├── obtener_url.php    # API para obtener/redirigir URLs
│   │   └── includes/
│   │       ├── constantes.php # Configuración de dominio
│   │       └── cors.php       # Permisos CORS
│   ├── config/
│   │   └── db.php             # Conexión a MySQL
│   └── database/              # (Opcional) Scripts SQL
└── README.md
```

## Instalación

1. **Clona el repositorio** en tu servidor local (ejemplo: MAMP/XAMPP).
2. **Configura la base de datos MySQL**:
	 - Crea una base de datos llamada `acortador`.
	 - Crea la tabla `urls` con la siguiente estructura:

		 ```sql
		 CREATE TABLE urls (
			 id INT AUTO_INCREMENT PRIMARY KEY,
			 url_vieja TEXT NOT NULL,
			 url_nueva VARCHAR(16) NOT NULL,
			 clicks INT DEFAULT 0
		 );
		 ```

3. **Ajusta credenciales** en `src/config/db.php` si es necesario.
4. **Configura el dominio** en `src/api/includes/constantes.php` según tu entorno local.
5. **Accede a `index.html`** desde tu navegador.

## Uso

- Ingresa la URL larga en el campo principal y haz clic en "Acortar Link".
- El sistema genera un enlace corto y lo muestra en pantalla.
- Puedes copiar el enlace acortado o crear uno nuevo.
- El backend almacena el enlace y cuenta los clics cada vez que se consulta.

## Endpoints principales

- `src/api/guardar_url.php`  
	Recibe una URL, la valida, genera un código corto y la guarda en la base de datos.

- `src/api/obtener_url.php`  
	Recibe el código corto, busca la URL original y aumenta el contador de clics.

## Seguridad y buenas prácticas

- Validación de URLs en frontend y backend.
- Permisos CORS configurados.
- Uso de consultas preparadas para evitar inyecciones SQL.
## Autor

Desarrollado por DevelopingJeremy.
