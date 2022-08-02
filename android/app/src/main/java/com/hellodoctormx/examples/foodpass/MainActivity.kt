package com.hellodoctormx.examples.foodpass

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import com.hellodoctormx.examples.foodpass.ui.theme.FoodPassTheme
import io.github.cdimascio.dotenv.dotenv
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

val dotenv = dotenv {
    directory = "/assets"
    filename = "env"
}

class MainActivity : ComponentActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        FirebaseApp.initializeApp(this)
        auth = Firebase.auth

        setContent {
            MaterialTheme {
                RappiApp(AppViewModel())
            }
        }
    }

    public override fun onStart() {
        super.onStart()

        val context = this

        auth.addAuthStateListener { listener ->
            listener.currentUser ?: return@addAuthStateListener

            FoodPassFirebaseMessagingService.registerFirebaseMessagingToken()

            CoroutineScope(Dispatchers.IO).launch {
                HelloDoctorHelper.configure(context)
            }
        }

        if (auth.currentUser == null) {
            auth.signInWithEmailAndPassword("demo.patient@hellodoctor.mx", "AnyColourYouLike")
//            auth.signInWithEmailAndPassword("fatisar@gmail.com", "Fati8123")
        }
    }
}
