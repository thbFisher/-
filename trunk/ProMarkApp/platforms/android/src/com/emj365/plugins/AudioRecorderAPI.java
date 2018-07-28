package com.emj365.plugins;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import android.media.MediaRecorder;
import android.media.MediaPlayer;
import android.media.AudioManager;
import android.os.CountDownTimer;
import android.os.Environment;
import android.content.Context;
import java.util.UUID;
import java.io.FileInputStream;
import java.io.File;
import java.io.IOException;
import java.text.DateFormat;  
import java.text.ParsePosition;  
import java.text.SimpleDateFormat;  
import java.util.Calendar;  
import java.util.Date;  


public class AudioRecorderAPI extends CordovaPlugin {

  private MediaRecorder myRecorder;
  private String outputFile;
  private CountDownTimer countDowntimer;

    /**   
     * 获取系统时间   
     * @return   
     */    
    public static String getDate(){  
        Calendar ca = Calendar.getInstance();     
        int year = ca.get(Calendar.YEAR);           // 获取年份     
        int month = ca.get(Calendar.MONTH);         // 获取月份      
        int day = ca.get(Calendar.DATE);            // 获取日     
        int minute = ca.get(Calendar.MINUTE);       // 分      
        int hour = ca.get(Calendar.HOUR);           // 小时      
        int second = ca.get(Calendar.SECOND);       // 秒     
       
        String date = "" + year + (month + 1 )+ day + hour + minute + second;  
          
        return date;           
    }  

    /**   
     * 获取SD path   
     * @return   
     */  
    public String getSDPath(){   
        File sdDir = null;   
        boolean sdCardExist = Environment.getExternalStorageState()   
                .equals(android.os.Environment.MEDIA_MOUNTED); // 判断sd卡是否存在   
        if (sdCardExist)   
        {   
            sdDir = Environment.getExternalStorageDirectory();// 获取跟目录   
            return sdDir.toString();   
        }  
          
        return null;  
    }  

  @Override
  public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
    Context context = cordova.getActivity().getApplicationContext();
    Integer seconds;
    if (args.length() >= 1) {
      seconds = args.getInt(0);
    } else {
      seconds = 7;
    }
    if (action.equals("record")) {
      // outputFile = context.getFilesDir().getAbsoluteFile() + "/"
      //   + UUID.randomUUID().toString() + ".m4a";
        // outputFile = context.getFilesDir().getAbsoluteFile() + "/"
        // + "A123" + ".m4a";
      myRecorder = new MediaRecorder();
      myRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
      myRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
      myRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
      myRecorder.setAudioSamplingRate(44100);
      myRecorder.setAudioChannels(1);
      myRecorder.setAudioEncodingBitRate(32000);

      String path = getSDPath();  
      if (path != null) {  
                              
          File dir = new File(path + "/recordCollection");  
          if (!dir.exists()) {  
                 dir.mkdir();  
          }  
          path = dir + "/" + getDate() + ".m4a";  
      }
      outputFile = path;
      myRecorder.setOutputFile(outputFile);

      try {
        myRecorder.prepare();
        myRecorder.start();
      } catch (final Exception e) {
        cordova.getThreadPool().execute(new Runnable() {
          public void run() {
            callbackContext.error(e.getMessage());
          }
        });
        return false;
      }

      countDowntimer = new CountDownTimer(seconds * 1000, 1000) {
        public void onTick(long millisUntilFinished) {}
        public void onFinish() {
          stopRecord(callbackContext);
        }
      };
      countDowntimer.start();
      return true;
    }

    if (action.equals("stop")) {
      countDowntimer.cancel();
      stopRecord(callbackContext);
      return true;
    }

    if (action.equals("playback")) {
      MediaPlayer mp = new MediaPlayer();
      mp.setAudioStreamType(AudioManager.STREAM_MUSIC);
      try {
        FileInputStream fis = new FileInputStream(new File(outputFile));
        mp.setDataSource(fis.getFD());
      } catch (IllegalArgumentException e) {
        e.printStackTrace();
      } catch (SecurityException e) {
        e.printStackTrace();
      } catch (IllegalStateException e) {
        e.printStackTrace();
      } catch (IOException e) {
        e.printStackTrace();
      }
      try {
        mp.prepare();
      } catch (IllegalStateException e) {
        e.printStackTrace();
      } catch (IOException e) {
        e.printStackTrace();
      }
      mp.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
        public void onCompletion(MediaPlayer mp) {
          callbackContext.success("playbackComplete");
        }
      });
      mp.start();
      return true;
    }

    return false;
  }

  private void stopRecord(final CallbackContext callbackContext) {
    myRecorder.stop();
    myRecorder.release();
    cordova.getThreadPool().execute(new Runnable() {
      public void run() {
        callbackContext.success(outputFile);
      }
    });
  }

}
