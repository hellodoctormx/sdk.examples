import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params: unknown): void {
    if (navigationRef.isReady()) {
        // @ts-ignore
        navigationRef.navigate(name, params);
    }
}

export function navigateToHome(): void {
    if (navigationRef.isReady()) {
        navigate('Home', {});
    }
}
