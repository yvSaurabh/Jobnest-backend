const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Password validation helper
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: "Password must be at least 8 characters long" };
    }
    if (!hasLowerCase || !hasUpperCase) {
        return { valid: false, message: "Password must contain both uppercase and lowercase letters" };
    }
    if (!hasNumbers) {
        return { valid: false, message: "Password must contain at least one number" };
    }
    return { valid: true, message: "Password is strong" };
};

// Email validation helper
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const registerUser = async(req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        // Validate name length
        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must be at least 2 characters long",
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message,
            });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });

        if(userExists) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            },
        });

            
    } catch (error){
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while registering user",
        });
    }
    
};

const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required fields",
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                name : user.name,
                email: user.email,
                token: generateToken(user._id),
            },
        });
      } catch(error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while logging in user",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    validatePassword,
};
