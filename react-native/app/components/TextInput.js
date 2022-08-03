import _ from 'lodash';
import React from 'react';
import {Animated, Text, TextInput as ReactNativeTextInput, TouchableOpacity, View} from 'react-native';
import HideableView from './HideableView';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import CollapsibleView from './CollapsibleView';
import {alpha, HelloDoctorColors, HelloDoctorFonts} from '../utils/theme';

export const defaultTextInputBorderColor = alpha(HelloDoctorColors.Gray500, 0.3);

export default function TextInput(props) {
    const [borderColorOverride, setShadowColorOverride] = React.useState(null);
    const [value, setValue] = React.useState(props.value);
    const [isFocused, setIsFocused] = React.useState(false);

    const shadowRadiusRef = React.useRef(new Animated.Value(0));
    const shadowHeightRef = React.useRef(new Animated.Value(0));
    const shadowOpacityRef = React.useRef(new Animated.Value(0));
    const labelOpacityRef = React.useRef(new Animated.Value(1));

    const containerRef = React.useRef({});
    const layoutRef = React.useRef({});
    const inputRef = React.useRef({});

    const isValid = props.minLength && props.required ? _.size(value) >= props.minLength
        : props.minLength ? _.isEmpty(value) || _.size(value) >= props.minLength
            : props.required ? !_.isEmpty(value)
                : true;

    React.useEffect(() => {
        if (props.hasError || !isValid) {
            setShadowColorOverride(HelloDoctorColors.Red300);
            doFocusAnimation();
        } else {
            setShadowColorOverride(null);
        }
    }, [props.hasError]);

    React.useEffect(() => {
        if (props.required || !isValid) {
            setShadowColorOverride(HelloDoctorColors.Red300);
        }
    }, [value]);

    React.useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const doFocusAnimation = () => Animated.parallel([
        Animated.timing(shadowRadiusRef.current, {toValue: 2, duration: 400, useNativeDriver: true}),
        Animated.timing(shadowHeightRef.current, {toValue: 2, duration: 400, useNativeDriver: true}),
        Animated.timing(shadowOpacityRef.current, {toValue: 0.3, duration: 400, useNativeDriver: true}),
        Animated.timing(labelOpacityRef.current, {toValue: 0.5, duration: 600, useNativeDriver: true}),
    ]).start();

    const doBlurAnimation = () => Animated.parallel([
        Animated.timing(shadowRadiusRef.current, {toValue: 0, duration: 300, useNativeDriver: true}),
        Animated.timing(shadowHeightRef.current, {toValue: 0, duration: 300, useNativeDriver: true}),
        Animated.timing(shadowOpacityRef.current, {toValue: 0, duration: 400, useNativeDriver: true}),
        Animated.timing(labelOpacityRef.current, {toValue: 1, duration: 300, useNativeDriver: true}),
    ]).start();

    const handleOnChangeText = value => {
        setValue(value);
        props.onChangeText(value);
    };

    const handleOnFocus = () => {
        setIsFocused(true);

        doFocusAnimation();

        if (props.onFocus) {
            props.onFocus();
        }

        if (!_.isEmpty(props.scrollRef)) {
            const scrollableNode = props.scrollRef.getScrollableNode();

            if (containerRef.current && !containerRef.current.measureLayout) {
                console.warn(`${props.label} is fucked up`, _.keys(containerRef.current));
            }

            const doScroll = () => containerRef.current?.measureLayout(scrollableNode, (left, top, width, height) => {
                const scrollMarginTop = props.scrollMarginTop || 128;
                const scrollToY = top - scrollMarginTop;
                console.debug('scrollToY', scrollToY);
                props.scrollRef.scrollTo({y: scrollToY});
            });

            const tryScroll = () => containerRef.current?.measureLayout && doScroll();

            // Wait for KeyboardMarginView to do its thing, if engaged
            setTimeout(tryScroll, 300);
        }
    };

    const handleOnBlur = () => {
        setIsFocused(false);

        if (!props.hasError && isValid) {
            doBlurAnimation();
        }

        if (props.onBlur) {
            props.onBlur();
        }
    };

    const setInputRef = ref => {
        inputRef.current = props.editable !== false ? ref : {
            focus: handleOnFocus,
            blur: handleOnBlur,
        };

        if (props.forwardRef) {
            props.forwardRef(inputRef.current);
        }
    };

    const handleOnPress = () => {
        if (props.disabled) {return;}

        inputRef.current.focus();

        if (props.onPress) {
            props.onPress();
        }
    };

    const renderedValue = props.value ? `${props.value}` : '';
    const requiredLabel = props.required && !isValid ? 'Obligatorio' : null;

    const validityColor = _.isEmpty(value) ? defaultTextInputBorderColor
        : isValid && !props.hasError ? HelloDoctorColors.Green500
            : HelloDoctorColors.Red300;

    return props.isHidden ? null : (
        <TouchableOpacity
            onPress={handleOnPress}
            ref={ref => containerRef.current = ref}
            onLayout={({nativeEvent}) => layoutRef.current = nativeEvent.layout}
            style={{
                padding: 3,
                paddingLeft: 6,
                paddingRight: 6,
                minHeight: props.display === 'none' ? 0 : props.multiline ? 128 : 0,
                overflow: props.display === 'none' ? 'hidden' : undefined,
                borderWidth: 1,
                borderRadius: 4,
                backgroundColor: 'white',
                borderColor: validityColor,
                ...props.containerStyle,
            }}>
            <HideableView isHidden={!props.label} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Animated.Text style={{flex: 1, opacity: labelOpacityRef.current, fontSize: 13, fontFamily: HelloDoctorFonts.TextRegular, color: HelloDoctorColors.Gray500, ...props.labelStyle}}>
                    {props.label}
                </Animated.Text>
                <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 13, color: HelloDoctorColors.Red300}}>{requiredLabel}</Text>
            </HideableView>
            {props.innerPlacement !== 'below-text' && props.children}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ReactNativeTextInput
                    testID={props.testID}
                    ref={setInputRef}
                    autoFocus={props.autoFocus}
                    placeholder={props.placeholder}
                    placeholderTextColor={props.placeholderTextColor}
                    value={renderedValue}
                    onChangeText={handleOnChangeText}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    editable={props.editable}
                    textContentType={props.textContentType}
                    keyboardType={props.keyboardType}
                    returnKeyType={props.returnKeyType}
                    selectionColor={props.selectionColor || HelloDoctorColors.Blue500}
                    maxLength={props.maxLength}
                    multiline={props.multiline}
                    blurOnSubmit={props.blurOnSubmit}
                    numberOfLines={props.numberOfLines}
                    autoComplete={props.autoComplete}
                    autoCapitalize={props.autoCapitalize}
                    secureTextEntry={props.secureTextEntry}
                    onSubmitEditing={props.onSubmitEditing}
                    clearButtonMode={props.clearButtonMode}
                    importantForAutofill={props.importantForAutofill}
                    style={{
                        maxHeight: props.display === 'none' ? 0 : undefined,
                        overflow: 'hidden',
                        flex: props.editable === false ? 0 : 1,
                        fontFamily: HelloDoctorFonts.TextRegular,
                        fontSize: 17,
                        color: HelloDoctorColors.Blue700,
                        ...props.style,
                    }}/>
                {/*<HideableView isHidden={!props.icon} style={{paddingRight: 6, paddingLeft: 6}}>*/}
                {/*    <TouchableIcon onPress={props.onPressIcon} name={props.icon} size={props.iconSize || 17} color={props.iconColor}/>*/}
                {/*</HideableView>*/}
                <HideableView isHidden={!props.required || props.icon || props.display === 'none'}>
                    <CollapsibleView isCollapsed={!isValid || props.hasError} horizontal={true}>
                        {/*<Icon name={'check'} size={17} color={hdColors.good}/>*/}
                    </CollapsibleView>
                </HideableView>
            </View>
            {props.innerPlacement === 'below-text' && props.children}
        </TouchableOpacity>
    );
}
