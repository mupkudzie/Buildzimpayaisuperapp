package com.afc.display

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.afc.display.bridge.AFCBridge
import com.afc.display.server.LocalVideoServer
import org.json.JSONArray
import java.io.File

/**
 * Example TV-box activity: loads the Vercel site and exposes local videos.
 *
 * 1. Copy videos to /sdcard/AFC/videos/ on the TV box
 * 2. Set VERCEL_URL to your deployed app
 * 3. Wire this activity as your launcher
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var videoServer: LocalVideoServer? = null

    private val videoDirectory: File
        get() = File(getExternalFilesDir(null), "videos").also { it.mkdirs() }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        startLocalVideoServer()

        val baseUrl = "http://127.0.0.1:$LOCAL_VIDEO_PORT/"
        webView.addJavascriptInterface(AFCBridge(videoDirectory, baseUrl), "AFCBridge")

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            allowFileAccess = true
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                pushPlaylistToWeb()
            }
        }

        webView.loadUrl(VERCEL_URL)
    }

    private fun startLocalVideoServer() {
        videoServer = LocalVideoServer(LOCAL_VIDEO_PORT, videoDirectory).also { it.start() }
    }

    /** Push updated playlist after adding/removing files on the box. */
    fun pushPlaylistToWeb() {
        val bridge = AFCBridge(videoDirectory, "http://127.0.0.1:$LOCAL_VIDEO_PORT/")
        val playlistJson = JSONArray(bridge.getVideoPlaylist()).toString()
        val js = """
            (function() {
              var urls = $playlistJson;
              window.dispatchEvent(new CustomEvent('afc-video-playlist', { detail: urls }));
              if (typeof window.onAFCVideoPlaylist === 'function') {
                window.onAFCVideoPlaylist(urls);
              }
            })();
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    override fun onDestroy() {
        videoServer?.stop()
        super.onDestroy()
    }

    companion object {
        private const val LOCAL_VIDEO_PORT = 8765
        private const val VERCEL_URL = "https://your-app.vercel.app/"
    }
}
