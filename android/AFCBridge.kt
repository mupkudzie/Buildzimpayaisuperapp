package com.afc.display.bridge

import android.webkit.JavascriptInterface
import org.json.JSONArray
import java.io.File

/**
 * Exposed to the Vercel web app as window.AFCBridge.
 * Register with: webView.addJavascriptInterface(AFCBridge(...), "AFCBridge")
 */
class AFCBridge(
    private val videoDirectory: File,
    private val baseUrl: String,
) {
    @JavascriptInterface
    fun isAndroidApp(): Boolean = true

    @JavascriptInterface
    fun getVideoBaseUrl(): String = baseUrl

    /**
     * Returns JSON array of playable URLs.
     * Filenames only also work — the web app prepends getVideoBaseUrl().
     */
    @JavascriptInterface
    fun getVideoPlaylist(): String {
        val files = videoDirectory
            .listFiles { f -> f.isFile && f.extension.lowercase() in VIDEO_EXTENSIONS }
            ?.sortedBy { it.name.lowercase() }
            ?: emptyList()

        val urls = JSONArray()
        val normalizedBase = baseUrl.trimEnd('/') + "/"
        for (file in files) {
            urls.put(normalizedBase + file.name)
        }
        return urls.toString()
    }

    companion object {
        private val VIDEO_EXTENSIONS = setOf("mp4", "webm", "mkv", "mov")
    }
}
