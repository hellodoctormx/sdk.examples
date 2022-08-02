import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params: any) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}

export function navigateToHome() {
    if (navigationRef.isReady()) {
        navigationRef.navigate('Home');
    }
}
