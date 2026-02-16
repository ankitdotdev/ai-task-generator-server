import bcrypt from "bcryptjs";

// Hashes a plain-text password before storing it in the database
// Uses salt rounds = 10 (balanced choice between security and performance)
export const bcryptHashPassword  = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Compares a plain-text password with the stored hashed password during login
export const bcryptCompareHashPassword = (
  password: string,
  hashPassword: string,
) => {
  return bcrypt.compare(password, hashPassword);
};
