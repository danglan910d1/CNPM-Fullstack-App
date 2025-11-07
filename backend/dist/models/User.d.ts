import { Document, Model } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    createdAt?: Date;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map