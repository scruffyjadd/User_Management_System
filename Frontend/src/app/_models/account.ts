import { Role } from './role';
export class Account {
    id?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: Role;
    jwtToken?: string;
    dateCreated?: string;
    isVerified?: boolean;
    refreshTokens: string[];
    verificationToken?: string;
    password?: string;
    resetToken?: string; 
    resetTokenExpires?: string;
    avatarUrl?: string;

    constructor() {
        this.refreshTokens = []; 
    }
}