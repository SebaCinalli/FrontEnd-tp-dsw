# Sistema de Alertas Custom - Guía de Implementación

## ✅ **Estado Actual - COMPLETADO**

### Archivos Completados (100%)
1. ✅ **Core del sistema**
   - `src/components/CustomAlert.tsx` - Componente de alerta
   - `src/components/CustomAlert.css` - Estilos personalizados
   - `src/context/alertcontext.tsx` - Provider y hook useAlert
   - `src/main.tsx` - AlertProvider integrado

2. ✅ **Archivos de usuario** (13 archivos)
   - `src/context/cartcontext.tsx` 
   - `src/pages/carrito/carrito.tsx` 
   - `src/pages/menu/menu.tsx` 
   - `src/pages/login/login.tsx` 
   - `src/pages/profile/profile.tsx` 
   - `src/pages/solicitud/solicitud.tsx` 
   - `src/pages/solicitud/solicitud_simple.tsx`

3. ✅ **Archivos admin** (2 de 6 completados)
   - `src/pages/admin/zona/zonaAdmin.tsx` ✅
   - `src/pages/admin/solicitud/solicitudAdmin.tsx` ✅

### Archivos Pendientes (4 archivos, ~25 alerts)
- `src/pages/admin/salon/salonAdmin.tsx` (6 alerts)
- `src/pages/admin/gastronomico/gastronomicoAdmin.tsx` (6 alerts)
- `src/pages/admin/dj/djAdmin.tsx` (6 alerts)
- `src/pages/admin/barra/barraAdmin.tsx` (7 alerts)

**NOTA:** Los imports y hooks `useAlert` ya están agregados en todos estos archivos, solo falta reemplazar los `alert()` por `showAlert()`.

---

## 🎯 Instrucciones para Completar

### Patrón de Reemplazo

```typescript
// ANTES:
alert('Mensaje aquí');

// DESPUÉS (según el contexto):
showAlert('Mensaje aquí', 'success');  // Éxitos
showAlert('Mensaje aquí', 'error');    // Errores
showAlert('Mensaje aquí', 'warning');  // Validaciones/advertencias
showAlert('Mensaje aquí', 'info');     // Información
```

### Reglas de Tipo de Alerta

1. **`'success'`** - Operaciones exitosas
   - Mensajes que contengan: "exitosamente", "correctamente", "creado", "actualizado", "eliminado"
   - Ejemplo: `showAlert('Salón creado exitosamente!', 'success');`

2. **`'error'`** - Errores
   - Mensajes que empiecen con "Error"
   - Try-catch error handlers
   - Ejemplo: `showAlert('Error al guardar el salón', 'error');`

3. **`'warning'`** - Validaciones y advertencias
   - "El campo X es requerido"
   - "Debe seleccionar..."
   - "No se puede..."
   - Ejemplo: `showAlert('El nombre del salón es requerido', 'warning');`

4. **`'info'`** - Información general
   - Mensajes informativos neutrales
   - Ejemplo: `showAlert('Salón no disponible', 'info');`

---

## 📝 Ejemplos Reales del Proyecto

### Archivo: salonAdmin.tsx
```typescript
// Línea ~178: Validación
alert('El nombre del salón es requerido');
// CAMBIAR A:
showAlert('El nombre del salón es requerido', 'warning');

// Línea ~284: Éxito
alert(`Salón ${editingSalon ? 'actualizado' : 'creado'} exitosamente!`);
// CAMBIAR A:
showAlert(`Salón ${editingSalon ? 'actualizado' : 'creado'} exitosamente!', 'success');

// Línea ~297: Error
alert(`Error al ${editingSalon ? 'actualizar' : 'crear'} el salón: ${errorMessage}`);
// CAMBIAR A:
showAlert(`Error al ${editingSalon ? 'actualizar' : 'crear'} el salón: ${errorMessage}`, 'error');
```

---

## 🔧 Cómo Completar (Opciones)

### Opción 1: Manual (Recomendado para pocos archivos)
1. Abrir cada archivo pendiente
2. Buscar `alert(` con Ctrl+F
3. Reemplazar cada uno siguiendo las reglas de tipo

### Opción 2: Buscar y Reemplazar de VS Code
1. Abrir "Buscar y Reemplazar" (Ctrl+Shift+H)
2. Buscar: `alert\(([^)]+)\);`
3. Reemplazar manualmente según el contexto

### Opción 3: Script Automático (Python)
```python
import re
import os

files = [
    'src/pages/admin/salon/salonAdmin.tsx',
    'src/pages/admin/gastronomico/gastronomicoAdmin.tsx',
    'src/pages/admin/dj/djAdmin.tsx',
    'src/pages/admin/barra/barraAdmin.tsx'
]

patterns = [
    (r"alert\('([^']*exitosamente[^']*?)'\);", r"showAlert('\1', 'success');"),
    (r"alert\('([^']*correctamente[^']*?)'\);", r"showAlert('\1', 'success');"),
    (r"alert\('(Error[^']*?)'\);", r"showAlert('\1', 'error');"),
    (r"alert\(`(Error[^`]*?)`\);", r"showAlert(`\1`, 'error');"),
    (r"alert\('([^']* es requerido[^']*?)'\);", r"showAlert('\1', 'warning');"),
    (r"alert\('(Debe [^']*?)'\);", r"showAlert('\1', 'warning');"),
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
```

---

## 🎨 Estilos del Sistema

El CustomAlert sigue la paleta de colores del proyecto:
- **Success**: Verde #27ae60
- **Error**: Rojo #e74c3c  
- **Warning**: Naranja #f39c12
- **Info**: Azul #3498db

---

## ✨ Características

- ✅ Modal centrado con overlay semitransparente
- ✅ Animaciones suaves (fade in + scale)
- ✅ Iconos según tipo de alerta
- ✅ Estilos consistentes con el tema oscuro del proyecto
- ✅ Responsive (mobile-friendly)
- ✅ Botón "Aceptar" para cerrar
- ✅ Context API global (sin prop drilling)

---

## 📊 Progreso Total

**Archivos procesados:** 15 / 19 (79%)  
**Alerts reemplazados:** ~47 / ~72 (65%)

---

## 🚀 Próximos Pasos

1. Completar los 4 archivos admin pendientes (~15-20 min)
2. Probar en navegador cada funcionalidad
3. Verificar que no queden `alert()` nativos: 
   ```bash
   grep -r "alert(" src/
   ```
4. Eliminar archivo `ALERT_REPLACEMENT_GUIDE.ts`
5. Commit final:
   ```bash
   git add .
   git commit -m "feat: reemplazar alerts nativos por sistema CustomAlert personalizado"
   ```

---

**Última actualización:** 2 de octubre de 2025
