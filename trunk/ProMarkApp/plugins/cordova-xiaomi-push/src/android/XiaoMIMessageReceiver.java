package com.zosftware.xiaomi;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.xiaomi.mipush.sdk.MiPushCommandMessage;
import com.xiaomi.mipush.sdk.MiPushMessage;
import com.xiaomi.mipush.sdk.PushMessageReceiver;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;

public class XiaoMIMessageReceiver extends PushMessageReceiver {
	String TAG = XiaoMIMessageReceiver.class.getSimpleName();

	@Override
	public void onNotificationMessageClicked(Context context, MiPushMessage message) {
		Log.v(TAG, "onNotificationMessageClicked is called. " + message.toString());

	}

	@Override
	public void onNotificationMessageArrived(Context context, MiPushMessage message) {
		Log.v(TAG, "onNotificationMessageArrived is called. " + message.toString());
	}

	@Override
	public void onReceiveRegisterResult(Context context, MiPushCommandMessage message) {
		Log.v(TAG, "onReceiveRegisterResult is called. " + message.toString());
	}

	@SuppressLint("SimpleDateFormat")
	public static String getSimpleDate() {
		return new SimpleDateFormat("MM-dd hh:mm:ss").format(new Date());
	}
}
