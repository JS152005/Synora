export interface RegisterUser {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginUser {
    email: string;
    password: string;
}



export interface UpdateProfile {
    fullName?: string;
    bio?: string;
    college?: string;
    course?: string;
    year?: string;
}