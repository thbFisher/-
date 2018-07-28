/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.zsoftware.promark897611;

import android.os.Bundle;
import com.zsoftware.encryptassets.CordovaActivity;  //这句很重要
import android.content.res.Configuration;
import android.content.res.Resources;
import org.apache.cordova.*;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.View;
import java.util.*;
import android.widget.Toast; 

public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
         super.onCreate(savedInstanceState);
       //开始解压缩 加密文件
        beginEcryptedAction();
        // 加载
        loadUrl(loadURL());

        checkRoot();
    }


     //检查手机是否被root
    private void checkRoot(){
      Root root = new Root();
      if(root.isDeviceRooted()){
        Toast.makeText(MainActivity.this, "设备可能被root,请注意数据安全", Toast.LENGTH_SHORT).show();
      }
    }

    @Override  
    public Resources getResources() {  
        Resources res = super.getResources();    
        Configuration config=new Configuration();    
        config.setToDefaults();    
        res.updateConfiguration(config,res.getDisplayMetrics() );  
        return res;  
    }  

    @Override
    protected void onStop() {
        super.onStop();
        boolean isCurrentRunningForeground = isRunningForeground();
        if (!isCurrentRunningForeground) {
          Toast.makeText(MainActivity.this, "服务一线已切换到后台运行", Toast.LENGTH_SHORT).show();
        }
    }

    //是否后台运行
    public boolean isRunningForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> appProcessInfos = activityManager.getRunningAppProcesses();
        // 枚举进程
        for (ActivityManager.RunningAppProcessInfo appProcessInfo : appProcessInfos) {
            if (appProcessInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                if (appProcessInfo.processName.equals(this.getApplicationInfo().processName)) {
                    Log.d(TAG, "MainActivity isRunningForeGround");
                    return true;
                }
            }
        }
        Log.d(TAG, "MainActivity isRunningBackGround");
        return false;
    }

}
