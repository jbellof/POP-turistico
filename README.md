# POP Turístico Inteligente

MVP académico estático. Abre `index.html` en cualquier navegador moderno. No necesita instalación, servidor, claves ni conexión a Internet.

## Publicar

- **GitHub Pages:** sube `index.html`, `styles.css` y `script.js` a la raíz del repositorio y habilita Pages desde la rama correspondiente.
- **Netlify:** arrastra esta carpeta al despliegue manual.
- **Vercel:** importa el repositorio como proyecto estático, sin comando de compilación; usa la raíz como directorio de salida.

## Comportamiento

El catálogo tiene 18 destinos. La regla busca coincidencia de tipo, clima y experiencia. Si no existe, conserva tipo y clima y devuelve el primer destino correspondiente del catálogo, mostrando la limitación. El número de viajeros es contexto y no altera el destino. Las reglas son demostrativas, no asesoría turística actualizada.

Las valoraciones nuevas permanecen únicamente en memoria hasta recargar o cerrar la página. Se pueden exportar como CSV. Nueva prueba limpia la interacción y conserva las filas de la sesión. No se solicita información personal. El comentario es opcional y el puntaje obligatorio.

La evidencia histórica muestra los tres resultados suministrados por el autor del proyecto; no se mezcla con las nuevas pruebas. Las mejoras propuestas se presentan como trabajo futuro.

ES / EN traduce el flujo funcional; la evidencia histórica y las próximas mejoras permanecen en español. No se utilizan servicios externos, backend, autenticación, reservas, machine learning ni IA generativa.
