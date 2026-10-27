export interface UserDetail {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profile: string;
    phone: string;
    isActive: boolean;
    enabled: boolean;
    credentialsNonExpired: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    authorities: Authority[];
}

export interface Authority {
    authority: string;
}

/*--------- SAMPLE USER JSON -------------
    "userId": 1,
    "firstName": "deepak",
    "lastName": "yadav",
    "username": "yadav_deepakk",
    "email": "deepak@yadav.com",
    "password": "${encrypted-password}",
    "profile": "default.png",
    "phone": "+91 9911223344",
    "isActive": true,
    "enabled": true,
    "credentialsNonExpired": true,
    "authorities": [
        {
            "authority": "ADMIN"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true
-------------------------------------------*/
