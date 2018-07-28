package com.zosftware.xiaomi;

import java.util.List;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.json.JSONArray;
import org.json.JSONException;

import com.xiaomi.mipush.sdk.MiPushClient;

import android.app.ActivityManager;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Process;

public class XiaoMIPushPlugin extends CordovaPlugin {
	/** LOG TAG */
	private static final String LOG_TAG = XiaoMIPushPlugin.class.getSimpleName();

	/**
	 * 插件主入口
	 */
	@Override
	public boolean execute(String action, final JSONArray args, CallbackContext callbackContext) throws JSONException {
		LOG.d(LOG_TAG, "XiaoMIPushPlugin#execute");
		boolean ret = false;

		if ("registerPushAndAccount".equalsIgnoreCase(action)) {
			try {
				registerPushAndAccount(String.valueOf(args.get(0)));
			} catch (NameNotFoundException e) {

			}
			ret = true;
		}
		
		if("unPushAndAccount".equalsIgnoreCase(action)){
			try {
				unPushAndAccount(String.valueOf(args.get(0)));
			} catch (NameNotFoundException e) {
				e.printStackTrace();
			}
		}

		return ret;
	}

	private void registerPushAndAccount(String Account) throws NameNotFoundException {
		ApplicationInfo appInfo = cordova.getActivity().getApplicationContext().getPackageManager().getApplicationInfo(
				cordova.getActivity().getApplicationContext().getPackageName(), PackageManager.GET_META_DATA);
		String XIAOMI_PUSH_APPID = appInfo.metaData.getString("XIAOMI_PUSH_APPID");
		XIAOMI_PUSH_APPID = XIAOMI_PUSH_APPID.replaceAll("_KEY_", "");
		String XIAOMI_PUSH_APPKEY = appInfo.metaData.getString("XIAOMI_PUSH_APPKEY");
		XIAOMI_PUSH_APPKEY = XIAOMI_PUSH_APPKEY.replaceAll("_KEY_", "");
		MiPushClient.registerPush(this.webView.getContext(), XIAOMI_PUSH_APPID, XIAOMI_PUSH_APPKEY);
		MiPushClient.setUserAccount(this.webView.getContext(), Account, null);
	}

	private void unPushAndAccount(String Account) throws NameNotFoundException {
		MiPushClient.unsetUserAccount(this.webView.getContext(), Account, null);
		MiPushClient.unregisterPush(this.webView.getContext());
	}

	private boolean shouldInit() {
		ActivityManager am = ((ActivityManager) this.webView.getContext().getSystemService(Context.ACTIVITY_SERVICE));
		List<RunningAppProcessInfo> processInfos = am.getRunningAppProcesses();
		String mainProcessName = this.webView.getContext().getPackageName();
		int myPid = Process.myPid();
		for (RunningAppProcessInfo info : processInfos) {
			if (info.pid == myPid && mainProcessName.equals(info.processName)) {
				return true;
			}
		}
		return false;
	}
}
