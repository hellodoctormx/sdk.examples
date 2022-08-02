import type Node from 'react';
import * as React from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {ThemeColors, ThemeFonts} from '../utils/theme';

type HomeScreenProps = {

}

export default function HomeScreen(props: HomeScreenProps): Node {
    return (
        <SafeAreaView style={{backgroundColor: ThemeColors.ScreenBackground}}>
            <View style={{flex: 1, backgroundColor: ThemeColors.ScreenBackground, padding: 18}}>
                <Text style={{fontFamily: ThemeFonts.TextTitle, fontSize: 20, color: ThemeColors.TextMain}}>
                    Welcome to the HelloDoctor React Native Example App
                </Text>
            </View>
        </SafeAreaView>
    );
}
