const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); 

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'avatars', // Carpeta donde se guardarán las imágenes
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 150, height: 150, crop: "fill" }]
    },
});

const upload = multer({ storage });

module.exports = upload;
