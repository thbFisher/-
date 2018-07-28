package com.zsoftware.update;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import com.pgyersdk.javabean.AppBean;
import com.pgyersdk.update.PgyUpdateManager;
import com.pgyersdk.update.UpdateManagerListener;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.widget.Toast;

public class PgyUpdatePlugin extends CordovaPlugin {
	@SuppressWarnings("unused")
	private Context mContext;

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		this.mContext = this.cordova.getActivity().getApplicationContext();
	}
	
	@Override
	public boolean execute(String action, JSONArray data, final CallbackContext callbackContext) throws JSONException {
		final Activity _activity = this.cordova.getActivity();
	 
		if(action.equals("exitAPP")){
		   System.exit(0);
		}
		
		
		if(action.equals("updateApp")){
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					PgyUpdateManager.register(_activity);
				}
			});
		}
		
		if(action.equals("updateAppAndListener")){
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					PgyUpdateManager.register(_activity,new UpdateManagerListener() {
						
						@Override
						public void onUpdateAvailable(String result) {
							   final AppBean appBean = getAppBeanFromString(result);
							   startDownloadTask(_activity, appBean.getDownloadURL());
							   callbackContext.success();
							//    new AlertDialog.Builder(_activity)
					        //     .setTitle("更新")
					        //     .setMessage("")
					        //     .setNegativeButton(
					        //             "确定",
					        //             new DialogInterface.OnClickListener() {

					        //                 @Override
					        //                 public void onClick(
					        //                         DialogInterface dialog,
					        //                         int which) {
					        //                     startDownloadTask(
					        //                     		_activity,
					        //                             appBean.getDownloadURL());
					        //                 }
					        //             }).show();
						}
						
						@Override
						public void onNoUpdateAvailable() {
							 Toast.makeText(_activity, "已是最新版", Toast.LENGTH_LONG);
						}
					});
				}
			});
		}

		// callbackContext.success();
		return true;
	}
}
