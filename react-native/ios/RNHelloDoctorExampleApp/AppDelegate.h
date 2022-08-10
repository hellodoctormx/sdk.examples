
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

#import "RNHelloDoctorVideoDelegate.h"
#import "RNHelloDoctorVideo.h"

#import <Firebase.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, FIRMessagingDelegate, RNHelloDoctorVideoDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic) FIRFirestore *firestore;
@property (nonatomic, strong) RNHelloDoctorVideo *helloDoctorVideo;

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;

@end
 
