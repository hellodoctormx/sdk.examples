import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params: unknown): void {
    console.debug(`[navigate:${name}:isReady:${navigationRef.isReady()}]`);
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}

export function navigateToHome(): void {
    if (navigationRef.isReady()) {
        try {
            navigate('Home', {});
        } catch(error) {
            console.warn(`[navigateToHome]`, error);
        }
    }
}
