package com.afc.display.server

import fi.iki.elonen.NanoHTTPD
import java.io.File
import java.io.FileInputStream

/**
 * Serves TV-box videos to the WebView over http://127.0.0.1:8765/
 *
 * Add dependency: implementation("org.nanohttpd:nanohttpd:2.3.1")
 */
class LocalVideoServer(
    port: Int,
    private val videoDirectory: File,
) : NanoHTTPD(port) {

    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri.removePrefix("/")
        if (uri.isBlank()) {
            return newFixedLengthResponse(Response.Status.OK, MIME_PLAINTEXT, "AFC local video server")
        }

        val target = File(videoDirectory, uri)
        if (!target.exists() || !target.isFile || !target.canonicalPath.startsWith(videoDirectory.canonicalPath)) {
            return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not found")
        }

        val mime = when (target.extension.lowercase()) {
            "mp4" -> "video/mp4"
            "webm" -> "video/webm"
            "mkv" -> "video/x-matroska"
            "mov" -> "video/quicktime"
            else -> "application/octet-stream"
        }

        return newFixedLengthResponse(
            Response.Status.OK,
            mime,
            FileInputStream(target),
            target.length(),
        )
    }
}
