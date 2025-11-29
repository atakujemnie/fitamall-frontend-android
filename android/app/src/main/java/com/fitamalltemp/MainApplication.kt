package com.fitamalltemp

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import com.imagepicker.ImagePickerPackage

class MainApplication : Application(), ReactApplication {

    private val mReactNativeHost: ReactNativeHost =
        object : ReactNativeHost(this) {

            override fun getUseDeveloperSupport(): Boolean {
                return true
            }

            override fun getPackages(): List<ReactPackage> {
                return listOf(
                    MainReactPackage(),
                    ImagePickerPackage()
                )
            }

            override fun getJSMainModuleName(): String {
                return "index"
            }
        }

    override fun getReactNativeHost(): ReactNativeHost {
        return mReactNativeHost
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
    }
}
