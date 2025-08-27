// Utilidad para subir imágenes al backend
export const uploadImage = async (
  entityType: string,
  entityId: number,
  file: File
): Promise<{ success: boolean; imageUrl?: string; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('imagen', file);

    console.log(
      `Subiendo imagen a: http://localhost:3000/api/${entityType}/${entityId}/upload-image`
    );
    console.log('Archivo:', file.name, file.size, file.type);

    const response = await fetch(
      `http://localhost:3000/api/${entityType}/${entityId}/upload-image`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include', // Usa cookies de sesión como el resto de tu app
      }
    );

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data completa:', result);
    console.log('Posibles URLs de imagen:');
    console.log('- result.imageUrl:', result.imageUrl);
    console.log('- result.foto:', result.foto);
    console.log('- result.data?.foto:', result.data?.foto);
    console.log('- result.url:', result.url);

    if (response.ok) {
      // Obtener el nombre del archivo desde la respuesta
      const fileName =
        result.data?.foto || result.foto || result.imageUrl || result.url;
      console.log('Nombre del archivo:', fileName);

      // Construir la URL completa según el tipo de entidad
      let finalImageUrl = '';
      if (fileName) {
        const baseUrls: { [key: string]: string } = {
          usuario: 'http://localhost:3000/uploads/usuarios/',
          dj: 'http://localhost:3000/uploads/djs/',
          barra: 'http://localhost:3000/uploads/barras/',
          salon: 'http://localhost:3000/uploads/salones/',
          gastronomico: 'http://localhost:3000/uploads/gastronomicos/',
        };

        const baseUrl = baseUrls[entityType];
        if (baseUrl) {
          finalImageUrl = `${baseUrl}${fileName}`;
          console.log('URL completa construida:', finalImageUrl);
        } else {
          console.error('Tipo de entidad no reconocido:', entityType);
          finalImageUrl = fileName;
        }
      }

      return {
        success: true,
        imageUrl: finalImageUrl,
        message: result.message || 'Imagen subida exitosamente',
      };
    } else {
      return {
        success: false,
        message: result.message || 'Error al subir la imagen',
      };
    }
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return {
      success: false,
      message: 'Error de conexión al subir la imagen',
    };
  }
};

// Función para validar tipos de archivo de imagen
export const isValidImageFile = (file: File): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validTypes.includes(file.type);
};

// Función para validar tamaño de archivo (en MB)
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Funciones específicas para cada entidad
export const uploadUsuarioImage = (usuarioId: number, file: File) =>
  uploadImage('usuario', usuarioId, file);

export const uploadDjImage = (djId: number, file: File) =>
  uploadImage('dj', djId, file);

export const uploadBarraImage = (barraId: number, file: File) =>
  uploadImage('barra', barraId, file);

export const uploadSalonImage = (salonId: number, file: File) =>
  uploadImage('salon', salonId, file);

export const uploadGastronomicoImage = (gastronomicoId: number, file: File) =>
  uploadImage('gastronomico', gastronomicoId, file);
