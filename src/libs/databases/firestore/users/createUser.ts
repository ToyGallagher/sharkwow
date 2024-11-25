import { addNewUser } from "./addNewUser";
import { UserModel } from "src/interfaces/models/user";
import { StatusCode } from "src/constants/statusCode";
import { CustomError } from "src/libs/errors/apiError";
import { dateToString } from "src/utils/date/dateConversion";
import { UserRole } from "src/interfaces/models/enums";

export async function createUser(userData?: Partial<UserModel>): Promise<void> {
    try {
        const uid = userData?.uid;
        if (!uid) {
            throw new CustomError("Uid not given", StatusCode.BAD_REQUEST);
        }

        const email = userData?.email;
        if (!email) {
            throw new CustomError("Email not given", StatusCode.BAD_REQUEST);
        }

        const newUser: UserModel = {
            uid,
            username: userData?.username || "",
            firstName: userData?.firstName || "",
            lastName: userData?.lastName || "",
            aboutMe: userData?.aboutMe || "",
            email,
            profileImageUrl: userData?.profileImageUrl || "",
            birthDate: userData?.birthDate || dateToString(new Date()),
            ownProjectIds: [],
            favoriteProjectIds: [],
            popularDetail: {
                totalProjectSuccess: 0,
                totalSupporter: 0,
            },
            receivedCommentIds: [],
            interestCategories: [],
            role: UserRole.USER,
            address: userData?.address || [],
            contact: userData.contact || {
                facebook: "",
                X: "",
                youtube: "",
                phone: "",
            },
            cvUrl: "",
            agreement: userData?.agreement || false,
            accountBank: "",
            accountHolderName: "",
            accountNumber: "",
        };

        await addNewUser(newUser);
    } catch (error: unknown) {
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError("Create user failed", StatusCode.INTERNAL_SERVER_ERROR);
    }
}
