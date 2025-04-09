import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaccia per il documento utente
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  role: string;
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema per il modello utente
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username è obbligatorio'],
    unique: true,
    trim: true,
    minlength: [3, 'Username deve essere di almeno 3 caratteri']
  },
  password: {
    type: String,
    required: [true, 'Password è obbligatoria'],
    minlength: [6, 'Password deve essere di almeno 6 caratteri'],
    validate: {
      validator: function(value: string) {
        // Verifica che la password contenga almeno una lettera maiuscola, una minuscola e un numero
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        return hasUpperCase && hasLowerCase && hasNumber;
      },
      message: 'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'
    }
  },
  email: {
    type: String,
    required: [true, 'Email è obbligatoria'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Formato email non valido']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  }
});

// Middleware pre-save per l'hashing della password
userSchema.pre<IUser>('save', async function(next) {
  // Esegui l'hash della password solo se è stata modificata o è nuova
  if (!this.isModified('password')) return next();
  
  try {
    // Genera un salt e hash della password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Metodo per confrontare le password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Crea e esporta il modello utente
const User = mongoose.model<IUser>('User', userSchema);
export default User;