/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBridgeDelegate.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <GoogleMaps/GoogleMaps.h>
#import <PushKit/PushKit.h>

#import <ZendeskCoreSDK/ZendeskCoreSDK.h>
#import <SupportProvidersSDK/SupportProvidersSDK.h>

#import "RNCallKeep.h"
#import "RNVoipPushNotificationManager.h"

#import "Orientation.h"

#import "ReactNativeConfig.h"

#import "CryptoModule.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    if ([FIRApp defaultApp] == nil) {
      [FIRApp configure];
    }
    
    [RNHelloDoctorVideo configure:@"HelloDoctor SDK Example"];
    
    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    
    RCTRootView *rootView = [[RCTRootView alloc]
                             initWithBridge:bridge
                             moduleName:@"RNHelloDoctorExampleApp"
                             initialProperties:nil];

    [FIRMessaging messaging].delegate = self;
  
    self.firestore = [FIRFirestore firestore];
    
    if (@available(iOS 13.0, *)) {
        rootView.backgroundColor = [UIColor systemBackgroundColor];
    } else {
        rootView.backgroundColor = [UIColor whiteColor];
    }
    
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    
    return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (NSArray *)extraModulesForBridge:(RCTBridge *)bridge
{
    return @[
        [[CryptoModule alloc] init]
    ];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  #if DEBUG
    [[FIRAuth auth] setAPNSToken:deviceToken type:FIRAuthAPNSTokenTypeSandbox];
  #else
    [[FIRAuth auth] setAPNSToken:deviceToken type:FIRAuthAPNSTokenTypeProd];
  #endif
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  if ([[FIRAuth auth] canHandleNotification:notification]) {
    completionHandler(UIBackgroundFetchResultNoData);
    return;
  }
}

- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
    NSLog(@"FCM registration token: %@", fcmToken);
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  NSLog(@"Unable to register for remote notifications: %@", error);
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> *restorableObjects))restorationHandler {
   return [RNCallKeep application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
 }

- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
    [RNHelloDoctorVideo pushRegistry:registry didUpdatePushCredentials:credentials forType:type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
    [RNHelloDoctorVideo pushRegistry:registry didInvalidatePushTokenForType:type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
    [RNHelloDoctorVideo pushRegistry:registry didReceiveIncomingPushWithPayload:payload forType:type withCompletionHandler:completion];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    return [Orientation getOrientation];
}

@end
