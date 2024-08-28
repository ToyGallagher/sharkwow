import { Timestamp } from "firebase-admin/firestore";
import { Address } from "./common";

export interface PopularDetail {
    totalProjectSuccess: number;
    totalSupporter: number;
}

export interface Contact {
    facebook: string;
    X: string;
    youtube: string;
    phone: string;
}

export interface UserModel {
    uid: string; // pk
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    aboutMe: string;
    email: string;
    profileImageUrl?: string;
    ownProjectIds: number[];
    favoriteProjectIds: string[];
    popularDetail: PopularDetail;
    receivedCommentIds: string[];
    interestCategories: string[];
    birthDate: Timestamp;
    address: Partial<Address>[];
    contact: Partial<Contact>;
    cvUrl: string;
    agreement: boolean;
}
