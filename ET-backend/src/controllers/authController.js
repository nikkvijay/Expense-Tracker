const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorHandler");

exports.signup = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return next(new ErrorResponse("User already exists", 400));
    }

    user = await User.create({ email, password });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      success: true,
      data: { 
        id: user._id,
        userId: user._id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
        bio: user.bio,
        avatar: user.avatar,
        token 
      },
    });
  } catch (error) {
    next(new ErrorResponse("Signup failed", 500));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      data: { 
        id: user._id,
        userId: user._id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
        bio: user.bio,
        avatar: user.avatar,
        token 
      },
    });
  } catch (error) {
    next(new ErrorResponse("Login failed", 500));
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Return all profile fields except password
    const userData = {
      id: user._id,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(new ErrorResponse("Failed to get profile", 500));
  }
};

exports.updateProfile = async (req, res, next) => {
  const { 
    email, 
    firstName, 
    lastName, 
    fullName, 
    phone, 
    dateOfBirth, 
    bio, 
    avatar 
  } = req.body;

  if (!email) {
    return next(new ErrorResponse("Email is required", 400));
  }

  try {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return next(new ErrorResponse("Email already in use", 400));
    }

    // Prepare update data - only include provided fields
    const updateData = { email };
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) {
      // Convert date string to Date object if provided
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Return complete user data
    const userData = {
      id: user._id,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(new ErrorResponse("Failed to update profile", 500));
  }
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse("Current and new password are required", 400));
  }

  if (newPassword.length < 6) {
    return next(new ErrorResponse("New password must be at least 6 characters", 400));
  }

  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse("Current password is incorrect", 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(new ErrorResponse("Failed to change password", 500));
  }
};
