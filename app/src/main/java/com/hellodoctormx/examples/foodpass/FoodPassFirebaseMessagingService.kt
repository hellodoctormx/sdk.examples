package com.hellodoctormx.examples.foodpass

import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.hellodoctormx.sdk.video.INCOMING_VIDEO_CALL_NOTIFICATION_ID
import com.hellodoctormx.sdk.video.IncomingVideoCallActivity
import com.hellodoctormx.sdk.video.IncomingVideoCallNotification
import com.hellodoctormx.sdk.video.VideoCallController

class FoodPassFirebaseMessagingService: FirebaseMessagingService() {
    private val tag = "FoodPassFirebaseMessagingService"

    override fun onNewToken(token: String) {
        Log.d(tag, "Refreshed token: $token")
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(tag, "Message data payload: ${remoteMessage.data}")
            when (remoteMessage.data["type"]) {
                "incomingVideoCall" -> run {
                    IncomingVideoCallNotification.display(
                        context = this,
                        videoRoomSID = remoteMessage.data["videoRoomSID"]!!,
                        callerDisplayName = remoteMessage.data["callerDisplayName"]!!,
                        callerPhotoURL = remoteMessage.data["callerPhotoURL"]
                    )
                }
                "videoCallEnded" -> run {
                    IncomingVideoCallNotification.cancel(this)
                }
            }
        }
    }

    companion object {
        fun registerFirebaseMessagingToken() {
            Firebase.auth.currentUser?.let { currentUser ->
                FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
                    if (!task.isSuccessful) {
                        Log.w("FPFirebaseMessagingService", "Fetching FCM registration token failed", task.exception)
                        return@OnCompleteListener
                    }

                    val token = task.result

                    Firebase.firestore
                        .document("users/${currentUser.uid}")
                        .update(mapOf("thirdPartyDeviceToken" to token))
                })
            }
        }
    }
}
