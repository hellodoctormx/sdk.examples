/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {onMessageReceived} from './app/notifications';

messaging().setBackgroundMessageHandler(async message =>  {
    onMessageReceived(message).catch(error => console.error(error));
});

AppRegistry.registerComponent(appName, () => App);
