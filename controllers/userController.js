const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2; // Asegúrate de configurar Cloudinary en utils
const dotenv = require("dotenv");

// Registro de usuario
exports.registerUser = async (req, res) => {
  try {
    console.log(req.body)
    const { username, email, password, avatar } = req.body;

    // Validaciones
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Subir avatar a Cloudinary (si se proporciona)
    let avatarUrl = "";
    if (avatar) {
      const uploadedAvatar = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        transformation: [{ width: 150, height: 150, crop: "fill" }],
      });
      avatarUrl = uploadedAvatar.secure_url;
    }

    // Crear usuario
    const user = new User({
      username,
      email,
      password,
      avatar: avatarUrl,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // El token expirará en 1 hora
    );
    res.status(201).json({
      message: "Usuario registrado con éxito",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('error en el registro: ', error)
    res.status(500).json({ message: error.message });
  }
};

// Login de usuario
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar Token
    const token = jwt.sign(
      { id: user._id, 
        username: user.username, 
        email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subir avatar (Actualizar perfil)
exports.uploadAvatar = async (req, res) => {
  try {
    const { userId, avatar } = req.body;

    if (!userId || !avatar) {
      return res
        .status(400)
        .json({ message: "Usuario y avatar son obligatorios" });
    }

    // Subir imagen a Cloudinary
    const uploadedAvatar = await cloudinary.uploader.upload(avatar, {
      folder: "avatars",
      transformation: [{ width: 150, height: 150, crop: "fill" }],
    });

    // Actualizar usuario con el nuevo avatar
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadedAvatar.secure_url },
      { new: true }
    );

    res.status(200).json({ message: "Avatar actualizado con éxito", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {

  try {
    const users = await User.find({}, "-password")
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
    if(!user) {
      return res.status(404).json({message: "Usuario no encontrado"})
    }

    if(user.avatar){
      const avatarPublicId = user.avatar.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`avatars/${avatarPublicId}`)
    }

    await User.findByIdAndDelete(id)

    res.status(200).json({message: 'Usuario eliminado con éxito'} )
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}