import {FirebaseAuthTypes} from '@react-native-firebase/auth';

export type UserDevice = {
    id: string
    fcmToken: string
    apnsToken: string
    createdTime: Date
    lastSeenTime: Date
}

export type CurrentUser = FirebaseAuthTypes.User & {
    helloDoctorUserID: string
    refreshToken: string
}
