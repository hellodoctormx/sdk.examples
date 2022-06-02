// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id ("com.android.application") version "7.2.0" apply false
    id ("org.jetbrains.kotlin.android") version "1.6.21" apply false
    id ("org.jetbrains.kotlin.multiplatform") version "1.6.21"
    id ("org.jetbrains.kotlin.plugin.serialization") version "1.6.21"
    id ("com.google.gms.google-services") version "4.3.10" // for firebase
}

kotlin {
    jvm()
}

buildscript {
    extra.apply {
        set("compileSdk", 32)
    }
}
