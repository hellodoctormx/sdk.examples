package com.rnhellodoctorexampleapp;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;

import io.invertase.notifee.NotifeeApiModule;

public class MainActivity extends ReactActivity implements ReactInstanceManager.ReactInstanceEventListener {
  private static final String TAG = "RNHelloDoctorExampleApp";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  @Override
  protected String getMainComponentName() {
    return NotifeeApiModule.getMainComponent(TAG);
  }

  @Override
  public void onReactContextInitialized(ReactContext context) {

  }
}