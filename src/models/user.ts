import * as mongoose from 'mongoose';

interface IUser extends mongoose.Document {
  username: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  password: String,
  username: {type: String, unique: true},
});

export const User = mongoose.model<IUser>(
  'User', userSchema);
